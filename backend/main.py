from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from database import init_db
from routers import entries, tasks, summaries, encouragement, settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="个人日历日记系统", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(entries.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(summaries.router, prefix="/api")
app.include_router(encouragement.router, prefix="/api")
app.include_router(settings.router, prefix="/api")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"

if FRONTEND_ASSETS.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS), name="assets")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
async def root():
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    return HTMLResponse(
        """
        <html>
          <head>
            <meta charset="utf-8" />
            <title>个人日记系统</title>
          </head>
          <body style="font-family: sans-serif; padding: 32px; line-height: 1.6;">
            <h1>个人日记系统后端已启动</h1>
            <p>当前没有检测到前端构建文件，所以页面未直接挂载到 8000 端口。</p>
            <p>开发模式请打开 <a href="http://localhost:5173">http://localhost:5173</a></p>
            <p>接口文档请打开 <a href="/docs">/docs</a></p>
          </body>
        </html>
        """
    )


@app.get("/{full_path:path}")
async def frontend_routes(full_path: str):
    if full_path.startswith(("api/", "docs", "openapi.json", "redoc", "assets/")):
        return HTMLResponse(status_code=404, content="Not Found")

    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    return HTMLResponse(status_code=404, content="Not Found")
