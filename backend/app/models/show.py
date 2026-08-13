from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Show(Base):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    first_air_year = Column(Integer)
    poster_path = Column(String(255))
    overview = Column(Text)
    number_of_seasons = Column(Integer)
    number_of_episodes = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ShowGenre(Base):
    __tablename__ = "show_genres"

    show_id = Column(Integer, ForeignKey("shows.id"), primary_key=True)
    genre_id = Column(Integer, ForeignKey("genres.id"), primary_key=True)


class ShowCast(Base):
    __tablename__ = "show_cast"

    show_id = Column(Integer, ForeignKey("shows.id"), primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("people.id"), primary_key=True, index=True)
    character_name = Column(String(255))