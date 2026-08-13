from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.sql import func
from app.database import Base

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id", ondelete="CASCADE"), nullable=True, index=True)
    rating = Column(Numeric(3, 1), nullable=False)
    review_text = Column(String(1000))
    watched_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "movie_id", name="uq_user_movie_rating"),
        UniqueConstraint("user_id", "show_id", name="uq_user_show_rating"),
        CheckConstraint("rating >= 0 AND rating <= 10", name="ck_rating_range"),
        CheckConstraint(
            "(movie_id IS NOT NULL AND show_id IS NULL) OR (movie_id IS NULL AND show_id IS NOT NULL)",
            name="ck_rating_exactly_one_target"
        ),
    )