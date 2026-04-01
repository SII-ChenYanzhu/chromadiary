import random
from typing import List

KEYWORD_MESSAGES = {
    "会议": [
        "今天的沟通很重要，每一次对话都在推动事情向前走。",
        "把想法说出来，是改变的开始。",
    ],
    "报告": [
        "整理思路的过程，本身就是一种收获。",
        "把做过的事写下来，它们就真的发生了。",
    ],
    "设计": [
        "好的设计需要时间酝酿，你在做对的事。",
        "审美是一种修炼，每天都在进步。",
    ],
    "代码": [
        "写代码就像搭积木，一块一块来，总能搭起来的。",
        "每一个 bug 修好，都是一次成长。",
    ],
    "学习": [
        "学新东西的时候总会有点慢，这很正常。",
        "今天学的，会在某个意想不到的地方用到。",
    ],
    "读书": [
        "读书是给自己充电，慢慢来。",
        "今天读了，就比昨天多了一点点。",
    ],
    "运动": [
        "动一动，思路也会跟着清晰起来。",
        "照顾好身体，才有力气做喜欢的事。",
    ],
    "休息": [
        "好好休息也是工作的一部分，不用愧疚。",
        "今天充好电，明天才有能量。",
    ],
    "写作": [
        "把想法写出来，它就真的存在了。",
        "文字是最好的整理方式。",
    ],
    "项目": [
        "项目推进总是一步一步的，今天又走了一步。",
        "每一点进展都算数。",
    ],
}

DEFAULT_MESSAGES = [
    "今天做的每一件事，都在悄悄地积累着什么。",
    "不需要每天都很高效，踏实做事就够了。",
    "小步前进，也是在前进。",
    "你已经在认真对待自己的生活了，这很好。",
    "有记录的日子，比没记录的更清晰一些。",
    "把今天过好，明天的事明天再说。",
    "做完一件事，就向前走了一步。",
    "认真生活的人，值得被温柔以待。",
    "今天的你，比昨天更了解自己一点。",
    "慢慢来，一切都来得及。",
    "记录本身就是一种珍视。",
    "今天也是值得被记住的一天。",
]


def get_encouragement_rule(tasks: List[dict], diary: str) -> str:
    """根据任务标题关键词匹配鼓励语，无匹配时使用默认池"""
    all_text = " ".join(t.get("title", "") for t in tasks) + " " + (diary or "")
    for keyword, messages in KEYWORD_MESSAGES.items():
        if keyword in all_text:
            return random.choice(messages)
    return random.choice(DEFAULT_MESSAGES)


async def get_encouragement_llm(tasks: List[dict], diary: str, api_key: str, provider: str, model: str) -> str:
    """LLM 模式：调用真实模型生成鼓励语"""
    task_titles = "、".join(t.get("title", "") for t in tasks if t.get("title"))
    prompt = (
        f"用户今天的任务：{task_titles or '暂无任务'}\n"
        f"用户今天的日记摘要：{diary[:200] if diary else '暂无日记'}\n\n"
        "请用温暖自然的语气，写一句鼓励的话（1-2句，不超过50字）。\n"
        "不要太鸡汤，不要过度夸张，像朋友说话一样。"
    )

    if provider == "anthropic":
        return await _call_anthropic(prompt, api_key, model or "claude-haiku-4-5-20251001")
    elif provider == "openai":
        return await _call_openai(prompt, api_key, model or "gpt-4o-mini")
    return get_encouragement_rule(tasks, diary)


async def _call_anthropic(prompt: str, api_key: str, model: str) -> str:
    import httpx
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": model,
        "max_tokens": 100,
        "messages": [{"role": "user", "content": prompt}],
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
        resp.raise_for_status()
        return resp.json()["content"][0]["text"].strip()


async def _call_openai(prompt: str, api_key: str, model: str) -> str:
    import httpx
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "max_tokens": 100,
        "messages": [{"role": "user", "content": prompt}],
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
