from fastapi import APIRouter, Depends
from database import get_db
from models import SummaryRequest, SummaryOut
from services import summary_service
import aiosqlite

router = APIRouter()


async def _get_settings(db: aiosqlite.Connection) -> dict:
    rows = await db.execute_fetchall("SELECT key, value FROM settings")
    return {r[0]: r[1] for r in rows}


async def _get_entries_in_range(start: str, end: str, db: aiosqlite.Connection):
    rows = await db.execute_fetchall(
        "SELECT date, diary, mood FROM day_entries WHERE date >= ? AND date <= ? ORDER BY date",
        (start, end)
    )
    entries = []
    for row in rows:
        entry = dict(row)
        task_rows = await db.execute_fetchall(
            "SELECT id, date, title, status, category, sort_order FROM tasks "
            "WHERE date = ? ORDER BY sort_order, id",
            (entry["date"],)
        )
        entry["tasks"] = [dict(t) for t in task_rows]
        entries.append(entry)
    return entries


@router.post("/summaries/week", response_model=SummaryOut)
async def generate_week(body: SummaryRequest, db: aiosqlite.Connection = Depends(get_db)):
    start, end = summary_service.get_week_range(body.date)
    settings = await _get_settings(db)
    entries = await _get_entries_in_range(start, end, db)

    provider = settings.get("llm_provider", "none")
    if provider != "none" and settings.get("api_key"):
        content = await summary_service.generate_week_summary_llm(
            entries, settings["api_key"], provider, settings.get("llm_model", "")
        )
        generated_by = "llm"
    else:
        content = summary_service.generate_week_summary_rule(entries)
        generated_by = "rule"

    await db.execute(
        "DELETE FROM summaries WHERE type = 'week' AND period_start = ? AND period_end = ?",
        (start, end)
    )
    cursor = await db.execute(
        "INSERT INTO summaries (type, period_start, period_end, content, generated_by) VALUES (?, ?, ?, ?, ?)",
        ("week", start, end, content, generated_by)
    )
    await db.commit()
    row = await db.execute_fetchall("SELECT * FROM summaries WHERE id = ?", (cursor.lastrowid,))
    return SummaryOut(**dict(row[0]))


@router.post("/summaries/month", response_model=SummaryOut)
async def generate_month(body: SummaryRequest, db: aiosqlite.Connection = Depends(get_db)):
    start, end = summary_service.get_month_range(body.date)
    settings = await _get_settings(db)
    entries = await _get_entries_in_range(start, end, db)

    provider = settings.get("llm_provider", "none")
    if provider != "none" and settings.get("api_key"):
        content = await summary_service.generate_month_summary_llm(
            entries, settings["api_key"], provider, settings.get("llm_model", "")
        )
        generated_by = "llm"
    else:
        content = summary_service.generate_month_summary_rule(entries)
        generated_by = "rule"

    await db.execute(
        "DELETE FROM summaries WHERE type = 'month' AND period_start = ? AND period_end = ?",
        (start, end)
    )
    cursor = await db.execute(
        "INSERT INTO summaries (type, period_start, period_end, content, generated_by) VALUES (?, ?, ?, ?, ?)",
        ("month", start, end, content, generated_by)
    )
    await db.commit()
    row = await db.execute_fetchall("SELECT * FROM summaries WHERE id = ?", (cursor.lastrowid,))
    return SummaryOut(**dict(row[0]))


@router.get("/summaries/week/{date}")
async def get_week_summary(date: str, db: aiosqlite.Connection = Depends(get_db)):
    start, end = summary_service.get_week_range(date)
    rows = await db.execute_fetchall(
        "SELECT * FROM summaries WHERE type = 'week' AND period_start = ? ORDER BY created_at DESC LIMIT 1",
        (start,)
    )
    if not rows:
        return None
    return SummaryOut(**dict(rows[0]))


@router.get("/summaries/month/{year_month}")
async def get_month_summary(year_month: str, db: aiosqlite.Connection = Depends(get_db)):
    start, end = summary_service.get_month_range(year_month)
    rows = await db.execute_fetchall(
        "SELECT * FROM summaries WHERE type = 'month' AND period_start = ? ORDER BY created_at DESC LIMIT 1",
        (start,)
    )
    if not rows:
        return None
    return SummaryOut(**dict(rows[0]))
