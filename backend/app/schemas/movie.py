from pydantic import BaseModel
from typing import Optional, List

class MovieSearchResult(BaseModel):
    tmdb_id: int
    title: str
    release_year: Optional[int] = None
    poster_path: Optional[str] = None
    overview: Optional[str] = None

class MovieOut(BaseModel):
    id: int
    tmdb_id: int
    title: str
    release_year: Optional[int] = None
    poster_path: Optional[str] = None
    overview: Optional[str] = None

    class Config:
        from_attributes = True

class PersonOut(BaseModel):
    id: int
    name: str
    profile_path: Optional[str] = None

    class Config:
        from_attributes = True

class MovieDetail(MovieOut):
    genres: List[str] = []
    cast: List[dict] = []
    directors: List[PersonOut] = []