from sqlalchemy import Column, Float, Integer, String
from .database import Base

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    timestamp = Column(String, nullable=False)
