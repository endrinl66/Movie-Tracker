from pydantic import BaseModel
from typing import Optional

class TopMovie(BaseModel):
    movie_id: int
    title: str
    poster_path: Optional[str] = None
    num_ratings: int
    avg_rating: float
    weighted_score: float

class TopShow(BaseModel):
    show_id: int
    title: str
    poster_path: Optional[str] = None
    num_ratings: int
    avg_rating: float
    weighted_score: float

class TopPerson(BaseModel):
    person_id: int
    name: str
    profile_path: Optional[str] = None
    num_ratings: int
    avg_rating: float
    weighted_score: float