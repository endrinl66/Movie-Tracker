from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.movie import Movie
from app.models.show import Show
from app.models.rating import Rating
from app.schemas.rating import RatingCreate, RatingOut

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.post("", response_model=RatingOut)
def create_rating(
    rating_in: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if rating_in.movie_id is not None:
        target = db.query(Movie).filter(Movie.id == rating_in.movie_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Movie not found")
        existing = db.query(Rating).filter(
            Rating.user_id == current_user.id,
            Rating.movie_id == rating_in.movie_id,
        ).first()
    else:
        target = db.query(Show).filter(Show.id == rating_in.show_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Show not found")
        existing = db.query(Rating).filter(
            Rating.user_id == current_user.id,
            Rating.show_id == rating_in.show_id,
        ).first()

    if existing:
        existing.rating = rating_in.rating
        existing.review_text = rating_in.review_text
        db.commit()
        db.refresh(existing)
        return existing

    rating = Rating(
        user_id=current_user.id,
        movie_id=rating_in.movie_id,
        show_id=rating_in.show_id,
        rating=rating_in.rating,
        review_text=rating_in.review_text,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating


@router.get("/movie/{movie_id}", response_model=list[RatingOut])
def get_ratings_for_movie(movie_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return (
        db.query(Rating)
        .filter(Rating.movie_id == movie_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/show/{show_id}", response_model=list[RatingOut])
def get_ratings_for_show(show_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return (
        db.query(Rating)
        .filter(Rating.show_id == show_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/me", response_model=list[RatingOut])
def get_my_ratings(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Rating)
        .filter(Rating.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )