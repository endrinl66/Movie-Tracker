from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.movie import Movie
from app.models.show import Show
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentOut

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("", response_model=CommentOut)
def create_comment(
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if comment_in.movie_id is not None:
        target = db.query(Movie).filter(Movie.id == comment_in.movie_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Movie not found")
    else:
        target = db.query(Show).filter(Show.id == comment_in.show_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Show not found")

    comment = Comment(
        user_id=current_user.id,
        movie_id=comment_in.movie_id,
        show_id=comment_in.show_id,
        text=comment_in.text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        **comment.__dict__,
        "username": current_user.username,
    }


@router.get("/movie/{movie_id}", response_model=list[CommentOut])
def get_comments_for_movie(movie_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment, User.username)
        .join(User, User.id == Comment.user_id)
        .filter(Comment.movie_id == movie_id)
        .order_by(Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [{**c.Comment.__dict__, "username": c.username} for c in comments]


@router.get("/show/{show_id}", response_model=list[CommentOut])
def get_comments_for_show(show_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment, User.username)
        .join(User, User.id == Comment.user_id)
        .filter(Comment.show_id == show_id)
        .order_by(Comment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [{**c.Comment.__dict__, "username": c.username} for c in comments]


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own comments")

    db.delete(comment)
    db.commit()
    return {"detail": "Deleted"}