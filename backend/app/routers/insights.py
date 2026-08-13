from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.insights import TopMovie, TopShow, TopPerson

router = APIRouter(prefix="/insights", tags=["insights"])

MIN_RATINGS_THRESHOLD = 1

@router.get("/top-movies", response_model=list[TopMovie])
def top_movies(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    query = text("""
        WITH stats AS (
            SELECT AVG(rating) AS global_avg FROM ratings
        ),
        movie_stats AS (
            SELECT movie_id, COUNT(*) AS num_ratings, AVG(rating) AS avg_rating
            FROM ratings
            WHERE movie_id IS NOT NULL
            GROUP BY movie_id
            HAVING COUNT(*) >= :min_threshold
        )
        SELECT
            m.id AS movie_id,
            m.title,
            m.poster_path,
            ms.num_ratings,
            ms.avg_rating,
            (ms.num_ratings / (ms.num_ratings + 5.0)) * ms.avg_rating +
            (5.0 / (ms.num_ratings + 5.0)) * s.global_avg AS weighted_score
        FROM movie_stats ms
        JOIN movies m ON m.id = ms.movie_id
        CROSS JOIN stats s
        ORDER BY weighted_score DESC
        LIMIT :limit OFFSET :skip
    """)
    rows = db.execute(query, {"min_threshold": MIN_RATINGS_THRESHOLD, "limit": limit, "skip": skip}).mappings().all()
    return [dict(row) for row in rows]


@router.get("/top-shows", response_model=list[TopShow])
def top_shows(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    query = text("""
        WITH stats AS (
            SELECT AVG(rating) AS global_avg FROM ratings
        ),
        show_stats AS (
            SELECT show_id, COUNT(*) AS num_ratings, AVG(rating) AS avg_rating
            FROM ratings
            WHERE show_id IS NOT NULL
            GROUP BY show_id
            HAVING COUNT(*) >= :min_threshold
        )
        SELECT
            s.id AS show_id,
            s.title,
            s.poster_path,
            ss.num_ratings,
            ss.avg_rating,
            (ss.num_ratings / (ss.num_ratings + 5.0)) * ss.avg_rating +
            (5.0 / (ss.num_ratings + 5.0)) * st.global_avg AS weighted_score
        FROM show_stats ss
        JOIN shows s ON s.id = ss.show_id
        CROSS JOIN stats st
        ORDER BY weighted_score DESC
        LIMIT :limit OFFSET :skip
    """)
    rows = db.execute(query, {"min_threshold": MIN_RATINGS_THRESHOLD, "limit": limit, "skip": skip}).mappings().all()
    return [dict(row) for row in rows]


@router.get("/top-actors", response_model=list[TopPerson])
def top_actors(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    query = text("""
        WITH stats AS (
            SELECT AVG(rating) AS global_avg FROM ratings
        ),
        actor_stats AS (
            SELECT mc.person_id, COUNT(*) AS num_ratings, AVG(r.rating) AS avg_rating
            FROM ratings r
            JOIN movie_cast mc ON mc.movie_id = r.movie_id
            GROUP BY mc.person_id
            HAVING COUNT(*) >= :min_threshold
        )
        SELECT
            p.id AS person_id,
            p.name,
            p.profile_path,
            a.num_ratings,
            a.avg_rating,
            (a.num_ratings / (a.num_ratings + 5.0)) * a.avg_rating +
            (5.0 / (a.num_ratings + 5.0)) * s.global_avg AS weighted_score
        FROM actor_stats a
        JOIN people p ON p.id = a.person_id
        CROSS JOIN stats s
        ORDER BY weighted_score DESC
        LIMIT :limit OFFSET :skip
    """)
    rows = db.execute(query, {"min_threshold": MIN_RATINGS_THRESHOLD, "limit": limit, "skip": skip}).mappings().all()
    return [dict(row) for row in rows]


@router.get("/top-directors", response_model=list[TopPerson])
def top_directors(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    query = text("""
        WITH stats AS (
            SELECT AVG(rating) AS global_avg FROM ratings
        ),
        director_stats AS (
            SELECT md.person_id, COUNT(*) AS num_ratings, AVG(r.rating) AS avg_rating
            FROM ratings r
            JOIN movie_directors md ON md.movie_id = r.movie_id
            GROUP BY md.person_id
            HAVING COUNT(*) >= :min_threshold
        )
        SELECT
            p.id AS person_id,
            p.name,
            p.profile_path,
            d.num_ratings,
            d.avg_rating,
            (d.num_ratings / (d.num_ratings + 5.0)) * d.avg_rating +
            (5.0 / (d.num_ratings + 5.0)) * s.global_avg AS weighted_score
        FROM director_stats d
        JOIN people p ON p.id = d.person_id
        CROSS JOIN stats s
        ORDER BY weighted_score DESC
        LIMIT :limit OFFSET :skip
    """)
    rows = db.execute(query, {"min_threshold": MIN_RATINGS_THRESHOLD, "limit": limit, "skip": skip}).mappings().all()
    return [dict(row) for row in rows]