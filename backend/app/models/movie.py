from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    release_year = Column(Integer)
    poster_path = Column(String(255))
    overview = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)


class MovieGenre(Base):
    __tablename__ = "movie_genres"

    movie_id = Column(Integer, ForeignKey("movies.id"), primary_key=True)
    genre_id = Column(Integer, ForeignKey("genres.id"), primary_key=True)