from pydantic import BaseModel
from typing import Optional, List

class ShowSearchResult(BaseModel):
    tmdb_id: int
    title: str
    first_air_year: Optional[int] = None
    poster_path: Optional[str] = None
    overview: Optional[str] = None

class ShowOut(BaseModel):
    id: int
    tmdb_id: int
    title: str
    first_air_year: Optional[int] = None
    poster_path: Optional[str] = None
    overview: Optional[str] = None
    number_of_seasons: Optional[int] = None
    number_of_episodes: Optional[int] = None

    class Config:
        from_attributes = True

class ShowDetail(ShowOut):
    genres: List[str] = []
    cast: List[dict] = []