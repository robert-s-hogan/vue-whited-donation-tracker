from fastapi import FastAPI
from app.main import app as fastapi_app
from mangum import Mangum

# Initialize Mangum adapter to make FastAPI compatible with AWS Lambda-like environments
app = Mangum(fastapi_app)
