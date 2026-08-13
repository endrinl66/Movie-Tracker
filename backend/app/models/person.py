from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_person_id = Column(Integer, unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    profile_path = Column(String(255))


class MovieCast(Base):
    __tablename__ = "movie_cast"

    movie_id = Column(Integer, ForeignKey("movies.id"), primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("people.id"), primary_key=True, index=True)
    character_name = Column(String(255))


class MovieDirector(Base):
    __tablename__ = "movie_directors"

    movie_id = Column(Integer, ForeignKey("movies.id"), primary_key=True)
    person_id = Column(Integer, ForeignKey("people.id"), primary_key=True)