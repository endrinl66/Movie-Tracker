from pydantic import BaseModel, model_validator
from typing import Optional, Literal
from datetime import datetime

class WatchStatusCreate(BaseModel):
    movie_id: Optional[int] = None
    show_id: Optional[int] = None
    status: Literal["want_to_watch", "watched"]

    @model_validator(mode="after")
    def check_exactly_one_target(self):
        if (self.movie_id is None) == (self.show_id is None):
            raise ValueError("Provide exactly one of movie_id or show_id")
        return self

class WatchStatusOut(BaseModel):
    id: int
    user_id: int
    movie_id: Optional[int] = None
    show_id: Optional[int] = None
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True