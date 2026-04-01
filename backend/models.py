from pydantic import BaseModel
from typing import Optional, List


class TaskCreate(BaseModel):
    date: str
    title: str
    status: str = "pending"
    category: str = ""
    sort_order: int = 0


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    sort_order: Optional[int] = None


class TaskOut(BaseModel):
    id: int
    date: str
    title: str
    status: str
    category: str
    sort_order: int


class DiaryUpdate(BaseModel):
    diary: str
    mood: str = ""


class DayEntryOut(BaseModel):
    date: str
    diary: str
    mood: str
    tasks: List[TaskOut] = []


class SummaryRequest(BaseModel):
    date: str  # 周报用：该周内任意一天；月报用：YYYY-MM


class SummaryOut(BaseModel):
    id: int
    type: str
    period_start: str
    period_end: str
    content: str
    generated_by: str
    created_at: str


class SettingsUpdate(BaseModel):
    llm_provider: str = "none"
    api_key: str = ""
    llm_model: str = ""


class SettingsOut(BaseModel):
    llm_provider: str
    api_key: str
    llm_model: str


class EncouragementOut(BaseModel):
    message: str
    source: str  # "rule" or "llm"
