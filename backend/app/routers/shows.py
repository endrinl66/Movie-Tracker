from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import tmdb_client
from app.models.show import Show, ShowGenre, ShowCast
from app.models.movie import Genre
from app.models.person import Person
from app.schemas.show import ShowOut, ShowDetail

router = APIRouter(prefix="/shows", tags=["shows"])

@router.get("/search")
async def search_shows(query: str):
    results = await tmdb_client.search_tv_shows(query)
    return results


@router.post("/ingest/{tmdb_id}", response_model=ShowOut)
async def ingest_show(tmdb_id: int, db: Session = Depends(get_db)):
    existing = db.query(Show).filter(Show.tmdb_id == tmdb_id).first()
    if existing:
        return existing

    details = await tmdb_client.get_show_details(tmdb_id)

    show = Show(
        tmdb_id=details["tmdb_id"],
        title=details["title"],
        first_air_year=details["first_air_year"],
        poster_path=details["poster_path"],
        overview=details["overview"],
        number_of_seasons=details["number_of_seasons"],
        number_of_episodes=details["number_of_episodes"],
    )
    db.add(show)
    db.flush()

    for genre_name in details["genres"]:
        genre = db.query(Genre).filter(Genre.name == genre_name).first()
        if not genre:
            genre = Genre(name=genre_name)
            db.add(genre)
            db.flush()
        db.add(ShowGenre(show_id=show.id, genre_id=genre.id))

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
        db.add(ShowCast(show_id=show.id, person_id=person.id, character_name=cast_member["character_name"]))

    db.commit()
    db.refresh(show)
    return show


@router.get("/{show_id}", response_model=ShowDetail)
def get_show(show_id: int, db: Session = Depends(get_db)):
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    genres = (
        db.query(Genre.name)
        .join(ShowGenre, ShowGenre.genre_id == Genre.id)
        .filter(ShowGenre.show_id == show_id)
        .all()
    )

    cast = (
        db.query(Person.id, Person.name, Person.profile_path, ShowCast.character_name)
        .join(ShowCast, ShowCast.person_id == Person.id)
        .filter(ShowCast.show_id == show_id)
        .all()
    )

    return {
        **show.__dict__,
        "genres": [g[0] for g in genres],
        "cast": [{"id": c[0], "name": c[1], "profile_path": c[2], "character_name": c[3]} for c in cast],
    }