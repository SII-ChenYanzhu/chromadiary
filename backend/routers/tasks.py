from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import TaskCreate, TaskUpdate, TaskOut
import aiosqlite

router = APIRouter()


@router.get("/tasks/{date}")
async def list_tasks(date: str, db: aiosqlite.Connection = Depends(get_db)):
    rows = await db.execute_fetchall(
        "SELECT id, date, title, status, category, sort_order FROM tasks "
        "WHERE date = ? ORDER BY sort_order, id",
        (date,)
    )
    return [dict(r) for r in rows]


@router.post("/tasks", response_model=TaskOut)
async def create_task(body: TaskCreate, db: aiosqlite.Connection = Depends(get_db)):
    # 确保 day_entry 存在
    await db.execute(
        "INSERT OR IGNORE INTO day_entries (date) VALUES (?)", (body.date,)
    )
    cursor = await db.execute(
        "INSERT INTO tasks (date, title, status, category, sort_order) VALUES (?, ?, ?, ?, ?)",
        (body.date, body.title, body.status, body.category, body.sort_order)
    )
    await db.commit()
    row = await db.execute_fetchall(
        "SELECT id, date, title, status, category, sort_order FROM tasks WHERE id = ?",
        (cursor.lastrowid,)
    )
    return TaskOut(**dict(row[0]))


@router.patch("/tasks/{task_id}", response_model=TaskOut)
async def update_task(task_id: int, body: TaskUpdate, db: aiosqlite.Connection = Depends(get_db)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="没有可更新的字段")
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [task_id]
    await db.execute(f"UPDATE tasks SET {set_clause} WHERE id = ?", values)
    await db.commit()
    row = await db.execute_fetchall(
        "SELECT id, date, title, status, category, sort_order FROM tasks WHERE id = ?",
        (task_id,)
    )
    if not row:
        raise HTTPException(status_code=404, detail="任务不存在")
    return TaskOut(**dict(row[0]))


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: aiosqlite.Connection = Depends(get_db)):
    await db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    await db.commit()
    return {"ok": True}
