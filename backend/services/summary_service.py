from typing import List, Dict
from datetime import date, timedelta
import calendar


def get_week_range(date_str: str):
    """返回包含 date_str 的周一到周日"""
    d = date.fromisoformat(date_str)
    monday = d - timedelta(days=d.weekday())
    sunday = monday + timedelta(days=6)
    return monday.isoformat(), sunday.isoformat()


def get_month_range(year_month: str):
    """返回月份的第一天和最后一天"""
    year, month = map(int, year_month.split("-"))
    last_day = calendar.monthrange(year, month)[1]
    return f"{year_month}-01", f"{year_month}-{last_day:02d}"


def generate_week_summary_rule(entries: List[Dict]) -> str:
    """规则生成周报"""
    if not entries:
        return "这周还没有记录，下周加油！"

    done_tasks = []
    pending_tasks = []
    diary_days = []

    for entry in entries:
        for task in entry.get("tasks", []):
            if task["status"] == "done":
                done_tasks.append(f"{entry['date']}：{task['title']}")
            else:
                pending_tasks.append(task["title"])
        if entry.get("diary", "").strip():
            diary_days.append(entry["date"])

    lines = ["## 本周回顾\n"]
    lines.append(f"**本周共完成 {len(done_tasks)} 项任务，记录了 {len(diary_days)} 天的日记。**\n")

    if done_tasks:
        lines.append("\n### 本周完成的事")
        for t in done_tasks:
            lines.append(f"- {t}")

    if pending_tasks:
        lines.append("\n### 待完成事项")
        for t in pending_tasks:
            lines.append(f"- {t}")

    if diary_days:
        lines.append("\n### 有记录的日子")
        lines.append("本周在 " + ", ".join(diary_days) + " 写了日记。")

    if len(done_tasks) >= 5:
        summary = "这周做了很多事，节奏不错，注意也要给自己留一些休息的时间。"
    elif len(done_tasks) > 0:
        summary = "这周迈出了几步，积累总是在悄悄发生的。"
    else:
        summary = "这周记录了想法，有时候思考本身也是一种推进。"

    lines.append(f"\n---\n_{summary}_")
    return "\n".join(lines)


def generate_month_summary_rule(entries: List[Dict]) -> str:
    """规则生成月报"""
    if not entries:
        return "这个月还没有记录，下个月开始吧！"

    all_done = []
    all_pending = []
    active_days = []
    word_freq: Dict[str, int] = {}

    for entry in entries:
        task_count = len(entry.get("tasks", []))
        done_count = sum(1 for t in entry.get("tasks", []) if t["status"] == "done")
        if task_count > 0:
            active_days.append((entry["date"], done_count, task_count))
        for task in entry.get("tasks", []):
            if task["status"] == "done":
                all_done.append(task["title"])
            else:
                all_pending.append(task["title"])
            for word in task["title"].split():
                if len(word) >= 2:
                    word_freq[word] = word_freq.get(word, 0) + 1

    hot_words = sorted(
        [w for w, c in word_freq.items() if c >= 2],
        key=lambda w: -word_freq[w]
    )[:5]

    lines = ["## 本月回顾\n"]
    lines.append(f"**本月共有 {len(active_days)} 天有任务记录，完成了 {len(all_done)} 项任务。**\n")

    if all_done:
        lines.append("\n### 本月完成的主要事项")
        for t in all_done[:10]:
            lines.append(f"- {t}")
        if len(all_done) > 10:
            lines.append(f"- ……以及另外 {len(all_done) - 10} 项")

    if hot_words:
        lines.append("\n### 本月高频关注")
        lines.append("本月出现频率较高的关键词：" + "、".join(hot_words))

    if active_days:
        most_active = sorted(active_days, key=lambda x: -x[1])[:3]
        lines.append("\n### 最充实的几天")
        for d, done, total in most_active:
            lines.append(f"- {d}：完成了 {done}/{total} 项任务")

    completion_rate = len(all_done) / max(len(all_done) + len(all_pending), 1)
    if completion_rate >= 0.8:
        closing = "这个月的完成率很高，你做到了很多事情，给自己一个鼓励。"
    elif completion_rate >= 0.5:
        closing = "这个月有推进、有停顿，这很正常。重要的是你一直在记录、在尝试。"
    else:
        closing = "这个月也许没能做完所有计划，但记录本身就是一种认真生活的方式。"

    lines.append(f"\n---\n_{closing}_")
    return "\n".join(lines)


async def generate_week_summary_llm(entries: List[Dict], api_key: str, provider: str, model: str) -> str:
    """LLM 周报生成"""
    data_summary = []
    for entry in entries:
        tasks_str = "；".join(
            f"{'✓' if t['status'] == 'done' else '○'} {t['title']}"
            for t in entry.get("tasks", [])
        )
        diary_snippet = entry.get("diary", "")[:100]
        line = f"{entry['date']}：{tasks_str or '无任务'}"
        if diary_snippet:
            line += f"  日记：{diary_snippet}"
        data_summary.append(line)

    prompt = (
        "以下是用户本周的记录：\n\n"
        + "\n".join(data_summary)
        + "\n\n请用温暖、自然的语气写一份本周回顾（300字以内），包含：\n"
        "1. 本周完成了哪些事\n2. 哪些事情推进较多\n3. 一句温暖的整体总结\n\n"
        "用 Markdown 格式输出，以 \"## 本周回顾\" 开头。"
    )

    from services.encouragement_service import _call_anthropic, _call_openai
    if provider == "anthropic":
        return await _call_anthropic(prompt, api_key, model or "claude-haiku-4-5-20251001")
    elif provider == "openai":
        return await _call_openai(prompt, api_key, model or "gpt-4o-mini")
    return generate_week_summary_rule(entries)


async def generate_month_summary_llm(entries: List[Dict], api_key: str, provider: str, model: str) -> str:
    """LLM 月报生成"""
    data_summary = []
    for entry in entries:
        tasks_str = "；".join(
            f"{'✓' if t['status'] == 'done' else '○'} {t['title']}"
            for t in entry.get("tasks", [])
        )
        data_summary.append(f"{entry['date']}：{tasks_str or '无任务'}")

    prompt = (
        "以下是用户本月的任务记录摘要：\n\n"
        + "\n".join(data_summary[:31])
        + "\n\n请用温暖、自然的语气写一份本月回顾（400字以内），包含：\n"
        "1. 本月主要完成内容\n2. 高频关注事项或主题\n3. 一段温暖的月度鼓励/反思\n\n"
        "用 Markdown 格式输出，以 \"## 本月回顾\" 开头。"
    )

    from services.encouragement_service import _call_anthropic, _call_openai
    if provider == "anthropic":
        return await _call_anthropic(prompt, api_key, model or "claude-haiku-4-5-20251001")
    elif provider == "openai":
        return await _call_openai(prompt, api_key, model or "gpt-4o-mini")
    return generate_month_summary_rule(entries)
