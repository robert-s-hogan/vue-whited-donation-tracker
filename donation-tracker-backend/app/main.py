import logging  # Ensure logging is imported
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas, database

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Allow CORS from the frontend
origins = [
    "http://localhost:8080",  # Allow requests from your Vue.js frontend
    # Add more origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the database tables
models.Base.metadata.create_all(bind=database.engine)

@app.post("/webhook", response_model=schemas.Donation)
async def paypal_webhook(event: schemas.DonationCreate, db: Session = Depends(database.get_db)):
    logging.info(f"Received webhook event: {event}")
    
    if event.transaction_id:
        # Check if the donation is already recorded
        donation = db.query(models.Donation).filter_by(transaction_id=event.transaction_id).first()
        
        if donation:
            logging.warning(f"Donation already recorded: {event.transaction_id}")
            raise HTTPException(status_code=400, detail="Donation already recorded")

        # Record the new donation
        new_donation = models.Donation(
            transaction_id=event.transaction_id,
            amount=event.amount,
            timestamp=event.timestamp
        )
        db.add(new_donation)
        db.commit()
        db.refresh(new_donation)
        
        logging.info(f"Donation recorded: {new_donation.amount} at {new_donation.timestamp}")
        return new_donation

@app.get("/api/donations/progress")
async def get_progress(db: Session = Depends(database.get_db)):
    total_raised = db.query(func.sum(models.Donation.amount)).scalar() or 0
    logging.info(f"Total raised calculated: {total_raised}")
    return {"totalRaised": total_raised}
