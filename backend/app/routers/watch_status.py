from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.movie import Movie
from app.models.show import Show
from app.models.watch_status import WatchStatus
from app.schemas.watch_status import WatchStatusCreate, WatchStatusOut

router = APIRouter(prefix="/watch-status", tags=["watch-status"])

@router.post("", response_model=WatchStatusOut)
def set_watch_status(
    status_in: WatchStatusCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if status_in.movie_id is not None:
        target = db.query(Movie).filter(Movie.id == status_in.movie_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Movie not found")
        existing = db.query(WatchStatus).filter(
            WatchStatus.user_id == current_user.id,
            WatchStatus.movie_id == status_in.movie_id,
        ).first()
    else:
        target = db.query(Show).filter(Show.id == status_in.show_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Show not found")
        existing = db.query(WatchStatus).filter(
            WatchStatus.user_id == current_user.id,
            WatchStatus.show_id == status_in.show_id,
        ).first()

    if existing:
        existing.status = status_in.status
        db.commit()
        db.refresh(existing)
        return existing

    watch_status = WatchStatus(
        user_id=current_user.id,
        movie_id=status_in.movie_id,
        show_id=status_in.show_id,
        status=status_in.status,
    )
    db.add(watch_status)
    db.commit()
    db.refresh(watch_status)
    return watch_status


@router.delete("")
def remove_watch_status(
    movie_id: int = None,
    show_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (movie_id is None) == (show_id is None):
        raise HTTPException(status_code=400, detail="Provide exactly one of movie_id or show_id")

    query = db.query(WatchStatus).filter(WatchStatus.user_id == current_user.id)
    if movie_id is not None:
        query = query.filter(WatchStatus.movie_id == movie_id)
    else:
        query = query.filter(WatchStatus.show_id == show_id)

    existing = query.first()
    if not existing:
        raise HTTPException(status_code=404, detail="Watch status not found")

    db.delete(existing)
    db.commit()
    return {"detail": "Removed"}


@router.get("/me", response_model=list[WatchStatusOut])
def get_my_watch_status(
    status: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(WatchStatus).filter(WatchStatus.user_id == current_user.id)
    if status:
        query = query.filter(WatchStatus.status == status)
    return query.offset(skip).limit(limit).all()