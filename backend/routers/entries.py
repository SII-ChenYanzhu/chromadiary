from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import DiaryUpdate, DayEntryOut, TaskOut
import aiosqlite

router = APIRouter()


@router.get("/entries/month/{year_month}")
async def get_month_dates(year_month: str, db: aiosqlite.Connection = Depends(get_db)):
    """返回该月内有日记或任务记录的日期列表，用于日历展示"""
    rows = await db.execute_fetchall(
        "SELECT DISTINCT date FROM day_entries WHERE date LIKE ? AND diary != ''",
        (f"{year_month}%",)
    )
    diary_dates = {row[0] for row in rows}
    task_rows = await db.execute_fetchall(
        "SELECT DISTINCT date FROM tasks WHERE date LIKE ?",
        (f"{year_month}%",)
    )
    task_dates = {row[0] for row in task_rows}
    all_dates = sorted(diary_dates | task_dates)
    return {
        "dates": all_dates,
        "diary_dates": sorted(diary_dates),
        "task_dates": sorted(task_dates),
    }


@router.get("/entries/{date}", response_model=DayEntryOut)
async def get_entry(date: str, db: aiosqlite.Connection = Depends(get_db)):
    row = await db.execute_fetchall(
        "SELECT date, diary, mood FROM day_entries WHERE date = ?", (date,)
    )
    if not row:
        return DayEntryOut(date=date, diary="", mood="", tasks=[])
    entry = dict(row[0])
    task_rows = await db.execute_fetchall(
        "SELECT id, date, title, status, category, sort_order FROM tasks "
        "WHERE date = ? ORDER BY sort_order, id",
        (date,)
    )
    tasks = [TaskOut(**dict(t)) for t in task_rows]
    return DayEntryOut(**entry, tasks=tasks)


@router.put("/entries/{date}", response_model=DayEntryOut)
async def upsert_entry(date: str, body: DiaryUpdate, db: aiosqlite.Connection = Depends(get_db)):
    await db.execute("""
        INSERT INTO day_entries (date, diary, mood, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(date) DO UPDATE SET
            diary = excluded.diary,
            mood = excluded.mood,
            updated_at = excluded.updated_at
    """, (date, body.diary, body.mood))
    await db.commit()
    return await _fetch_full_entry(date, db)


async def _fetch_full_entry(date: str, db: aiosqlite.Connection) -> DayEntryOut:
    row = await db.execute_fetchall(
        "SELECT date, diary, mood FROM day_entries WHERE date = ?", (date,)
    )
    entry = dict(row[0]) if row else {"date": date, "diary": "", "mood": ""}
    task_rows = await db.execute_fetchall(
        "SELECT id, date, title, status, category, sort_order FROM tasks "
        "WHERE date = ? ORDER BY sort_order, id",
        (date,)
    )
    tasks = [TaskOut(**dict(t)) for t in task_rows]
    return DayEntryOut(**entry, tasks=tasks)
