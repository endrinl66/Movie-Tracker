from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime

BANNED_WORDS = {"fuck", "shit", "bitch", "asshole", "cunt", "nigger", "faggot"}

class CommentCreate(BaseModel):
    movie_id: Optional[int] = None
    show_id: Optional[int] = None
    text: str = Field(..., min_length=1, max_length=1000)

    @field_validator("text")
    @classmethod
    def check_profanity(cls, value):
        lowered = value.lower()
        for word in BANNED_WORDS:
            if word in lowered:
                raise ValueError("Comment contains inappropriate language")
        return value

    @model_validator(mode="after")
    def check_exactly_one_target(self):
        if (self.movie_id is None) == (self.show_id is None):
            raise ValueError("Provide exactly one of movie_id or show_id")
        return self

class CommentOut(BaseModel):
    id: int
    user_id: int
    username: str
    movie_id: Optional[int] = None
    show_id: Optional[int] = None
    text: str
    created_at: datetime

    class Config:
        from_attributes = True