from pydantic import BaseModel

class DonationBase(BaseModel):
    transaction_id: str
    amount: float
    timestamp: str

class DonationCreate(DonationBase):
    pass

class Donation(DonationBase):
    id: int

    class Config:
        from_attributes = True  # Updated to new Pydantic v2 key
