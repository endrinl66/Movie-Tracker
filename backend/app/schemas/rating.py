from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime

BANNED_WORDS = {"fuck", "shit", "bitch", "asshole", "cunt", "nigger", "faggot"}

class RatingCreate(BaseModel):
    movie_id: Optional[int] = None
    show_id: Optional[int] = None
    rating: float = Field(..., ge=0, le=10)
    review_text: Optional[str] = Field(None, max_length=1000)

    @field_validator("review_text")
    @classmethod
    def check_profanity(cls, value):
        if value:
            lowered = value.lower()
            for word in BANNED_WORDS:
                if word in lowered:
                    raise ValueError("Review contains inappropriate language")
        return value

    @model_validator(mode="after")
    def check_exactly_one_target(self):
        if (self.movie_id is None) == (self.show_id is None):
            raise ValueError("Provide exactly one of movie_id or show_id")
        return self

class RatingOut(BaseModel):
    id: int
    user_id: int
    movie_id: Optional[int] = None
    show_id: Optional[int] = None
    rating: float
    review_text: Optional[str] = None
    watched_at: datetime

    class Config:
        from_attributes = True