from fastapi import APIRouter, Depends
from database import get_db
from models import SettingsUpdate, SettingsOut
import aiosqlite

router = APIRouter()


@router.get("/settings", response_model=SettingsOut)
async def get_settings(db: aiosqlite.Connection = Depends(get_db)):
    rows = await db.execute_fetchall("SELECT key, value FROM settings")
    data = {r[0]: r[1] for r in rows}
    return SettingsOut(
        llm_provider=data.get("llm_provider", "none"),
        api_key=data.get("api_key", ""),
        llm_model=data.get("llm_model", ""),
    )


@router.put("/settings", response_model=SettingsOut)
async def update_settings(body: SettingsUpdate, db: aiosqlite.Connection = Depends(get_db)):
    await db.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('llm_provider', ?)",
        (body.llm_provider,)
    )
    await db.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('api_key', ?)",
        (body.api_key,)
    )
    await db.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('llm_model', ?)",
        (body.llm_model,)
    )
    await db.commit()
    return SettingsOut(
        llm_provider=body.llm_provider,
        api_key=body.api_key,
        llm_model=body.llm_model
    )
