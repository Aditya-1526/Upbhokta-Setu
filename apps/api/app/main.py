import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings

# Configure structured logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger("upbhokta-setu")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Starting %s v%s [%s]",
        settings.app_name,
        settings.app_version,
        settings.app_env,
    )
    yield
    logger.info("Shutting down")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-assisted consumer grievance preparation platform.",
    lifespan=lifespan,
)

# CORS — explicit origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):\d+$"
    if settings.app_env == "development"
    else None,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    path = request.url.path
    logger.warning("HTTP %s %s", exc.status_code, path)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "code": exc.status_code,
            "message": exc.detail or "An error occurred.",
            "path": path,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "code": 500,
            "message": "Internal server error.",
            "path": request.url.path,
        },
    )


# --- Health endpoints ---

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": settings.app_name, "version": settings.app_version}


@app.get(f"{settings.api_prefix}/health", tags=["health"])
def api_health():
    return health()


# --- Routers ---
from .routers import cases, drafts

app.include_router(cases.router, prefix=settings.api_prefix)
app.include_router(drafts.router, prefix=settings.api_prefix)
