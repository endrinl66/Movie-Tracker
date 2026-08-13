from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine
from app.routers import movies, auth, ratings, insights, users, shows, watch_status, comments, translate

app = FastAPI(title="Movie Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://movie-tracker-one-sandy.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies.router)
app.include_router(auth.router)
app.include_router(translate.router)
app.include_router(ratings.router)
app.include_router(insights.router)
app.include_router(watch_status.router)
app.include_router(comments.router)
app.include_router(users.router)
app.include_router(shows.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Movie Tracker API is running"}

@app.get("/health/db")
def db_health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"database": "connected"}
    except Exception as e:
        return {"database": "error", "detail": str(e)}