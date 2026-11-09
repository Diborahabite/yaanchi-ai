"""
Yanchi AI — FastAPI Application Entry Point
Ethiopian Labour Proclamation No. 1156/2019 — Legal Guidance & Wage Calculation Platform
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend root is always on sys.path regardless of how/where it is launched
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse

from app.config import get_settings
from app.api.routes import wage, legal_qa, audio
from app.core.rag_engine import RAGEngine

settings = get_settings()

STATIC_APP_FILE = BACKEND_DIR / "app" / "static" / "index.html"

# Shared RAG engine instance initialised on startup
_rag_engine: RAGEngine | None = None


def get_rag_engine() -> RAGEngine:
    """Return the application-wide RAG engine (initialised at startup)."""
    if _rag_engine is None:
        raise RuntimeError("RAG engine has not been initialised. Is the app running?")
    return _rag_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise heavy resources on startup, clean up on shutdown."""
    global _rag_engine
    _rag_engine = RAGEngine(vector_db_path=settings.VECTOR_DB_PATH)
    _rag_engine.load()

    # Make the engine available to route modules via app state
    app.state.rag_engine = _rag_engine

    print(f"[{settings.APP_NAME}] RAG Engine loaded with {_rag_engine.document_count} labour law articles.")
    yield  # Application runs here

    # Shutdown: clean up
    _rag_engine = None


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=(
        "AI-powered legal guidance and wage calculation platform "
        "under Ethiopian Labour Proclamation No. 1156/2019."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow all origins so mobile clients (localhost, emulator, LAN) can connect
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
API_PREFIX = "/api/v1"

app.include_router(wage.router, prefix=API_PREFIX, tags=["Wage Calculator"])
app.include_router(legal_qa.router, prefix=API_PREFIX, tags=["Legal Q&A"])
app.include_router(audio.router, prefix=API_PREFIX, tags=["Audio"])


# ---------------------------------------------------------------------------
# Frontend Interactive Mobile Web App
# ---------------------------------------------------------------------------

STATIC_CALC_FILE = BACKEND_DIR / "app" / "static" / "calculator.html"

@app.get("/calculator", tags=["Frontend App"], response_class=HTMLResponse)
async def serve_calculator_app():
    """Serves the stealth normal calculator disguise matching user screenshot."""
    if STATIC_CALC_FILE.exists():
        return FileResponse(STATIC_CALC_FILE)
    return HTMLResponse("<h1>Calculator</h1><p>calculator.html not found.</p>")

@app.get("/app", tags=["Frontend App"], response_class=HTMLResponse)
async def serve_mobile_app():
    """Serves the complete bilingual Yanchi AI mobile app in browser."""
    if STATIC_APP_FILE.exists():
        return FileResponse(STATIC_APP_FILE)
    return HTMLResponse("<h1>Yanchi AI Web App</h1><p>Static index.html not found.</p>")


# ---------------------------------------------------------------------------
# Root / health endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
async def root(request: Request):
    """
    Root endpoint:
    - If accessed from a web browser (accept: text/html), serves the interactive mobile app.
    - If accessed by API client, returns status JSON.
    """
    accept = request.headers.get("accept", "")
    if "text/html" in accept and STATIC_APP_FILE.exists():
        return FileResponse(STATIC_APP_FILE)

    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "ok",
        "web_app": "/app",
        "docs": "/docs",
    }


@app.get(f"{API_PREFIX}/health", tags=["Health"])
async def health() -> dict:
    """Detailed health check with version information."""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "app": settings.APP_NAME,
        "proclamation": "Ethiopian Labour Proclamation No. 1156/2019",
    }


if __name__ == "__main__":
    import uvicorn
    print(f"\n========================================================")
    print(f" Starting {settings.APP_NAME} Backend & Web App on port 8000...")
    print(f" Web App:   http://localhost:8000/app")
    print(f" API Docs:  http://localhost:8000/docs")
    print(f"========================================================\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
