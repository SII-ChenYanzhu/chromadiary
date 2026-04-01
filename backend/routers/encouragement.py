from fastapi import APIRouter, Depends
from database import get_db
from models import EncouragementOut
from services import encouragement_service
import aiosqlite

router = APIRouter()


@router.get("/encouragement/{date}", response_model=EncouragementOut)
async def get_encouragement(date: str, db: aiosqlite.Connection = Depends(get_db)):
    task_rows = await db.execute_fetchall(
        "SELECT title, status FROM tasks WHERE date = ?", (date,)
    )
    tasks = [dict(r) for r in task_rows]

    diary_row = await db.execute_fetchall(
        "SELECT diary FROM day_entries WHERE date = ?", (date,)
    )
    diary = diary_row[0]["diary"] if diary_row else ""

    settings_rows = await db.execute_fetchall("SELECT key, value FROM settings")
    settings = {r[0]: r[1] for r in settings_rows}

    provider = settings.get("llm_provider", "none")
    if provider != "none" and settings.get("api_key"):
        message = await encouragement_service.get_encouragement_llm(
            tasks, diary, settings["api_key"], provider, settings.get("llm_model", "")
        )
        source = "llm"
    else:
        message = encouragement_service.get_encouragement_rule(tasks, diary)
        source = "rule"

    return EncouragementOut(message=message, source=source)
