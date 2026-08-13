from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.sql import func
from app.database import Base

class WatchStatus(Base):
    __tablename__ = "watch_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id", ondelete="CASCADE"), nullable=True, index=True)
    status = Column(String(20), nullable=False)  # "want_to_watch" or "watched"
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "movie_id", name="uq_user_movie_watch"),
        UniqueConstraint("user_id", "show_id", name="uq_user_show_watch"),
        CheckConstraint(
            "(movie_id IS NOT NULL AND show_id IS NULL) OR (movie_id IS NULL AND show_id IS NOT NULL)",
            name="ck_watch_exactly_one_target"
        ),
        CheckConstraint(
            "status IN ('want_to_watch', 'watched')",
            name="ck_watch_status_valid"
        ),
    )