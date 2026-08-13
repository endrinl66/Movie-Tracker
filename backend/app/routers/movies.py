from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import tmdb_client
from app.models.movie import Movie, Genre, MovieGenre
from app.models.person import Person, MovieCast, MovieDirector
from app.schemas.movie import MovieOut, MovieDetail

router = APIRouter(prefix="/movies", tags=["movies"])

@router.get("/search")
async def search_movies(query: str):
    results = await tmdb_client.search_movies(query)
    return results

@router.get("/trending/backdrop")
async def trending_backdrop():
    results = await tmdb_client.get_backdrop_movies()
    return results

@router.post("/ingest/{tmdb_id}", response_model=MovieOut)
async def ingest_movie(tmdb_id: int, db: Session = Depends(get_db)):
    existing = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
    if existing:
        return existing

    details = await tmdb_client.get_movie_details(tmdb_id)

    movie = Movie(
        tmdb_id=details["tmdb_id"],
        title=details["title"],
        release_year=details["release_year"],
        poster_path=details["poster_path"],
        overview=details["overview"],
    )
    db.add(movie)
    db.flush()

    for genre_name in details["genres"]:
        genre = db.query(Genre).filter(Genre.name == genre_name).first()
        if not genre:
            genre = Genre(name=genre_name)
            db.add(genre)
            db.flush()
        db.add(MovieGenre(movie_id=movie.id, genre_id=genre.id))

    for cast_member in details["cast"]:
        person = db.query(Person).filter(Person.tmdb_person_id == cast_member["tmdb_person_id"]).first()
        if not person:
            person = Person(
                tmdb_person_id=cast_member["tmdb_person_id"],
                name=cast_member["name"],
                profile_path=cast_member["profile_path"],
            )
            db.add(person)
            db.flush()
        db.add(MovieCast(movie_id=movie.id, person_id=person.id, character_name=cast_member["character_name"]))

    for director in details["directors"]:
        person = db.query(Person).filter(Person.tmdb_person_id == director["tmdb_person_id"]).first()
        if not person:
            person = Person(
                tmdb_person_id=director["tmdb_person_id"],
                name=director["name"],
                profile_path=director["profile_path"],
            )
            db.add(person)
            db.flush()
        db.add(MovieDirector(movie_id=movie.id, person_id=person.id))

    db.commit()
    db.refresh(movie)
    return movie


@router.get("/{movie_id}", response_model=MovieDetail)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    genres = (
        db.query(Genre.name)
        .join(MovieGenre, MovieGenre.genre_id == Genre.id)
        .filter(MovieGenre.movie_id == movie_id)
        .all()
    )

    cast = (
        db.query(Person.id, Person.name, Person.profile_path, MovieCast.character_name)
        .join(MovieCast, MovieCast.person_id == Person.id)
        .filter(MovieCast.movie_id == movie_id)
        .all()
    )

    directors = (
        db.query(Person)
        .join(MovieDirector, MovieDirector.person_id == Person.id)
        .filter(MovieDirector.movie_id == movie_id)
        .all()
    )

    return {
        **movie.__dict__,
        "genres": [g[0] for g in genres],
        "cast": [{"id": c[0], "name": c[1], "profile_path": c[2], "character_name": c[3]} for c in cast],
        "directors": directors,
    }