
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from app.core.logging_config import setup_logging
setup_logging()

import logging
logger = logging.getLogger(__name__)

from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import engine
from app.routers import auth_router


from app.database.database import engine, Base
from app.models import user_model, otp_model # Import your models so Base knows them

import logging
logger = logging.getLogger(__name__)

app = FastAPI()
logger.info("FastAPI application initialized.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS middleware configured.")

@app.get("/health")
def get_health():
    logger.info("Health check endpoint called.")
    return {"status": "healthy"}


app.include_router(router=auth_router.router)



# This creates the actual database tables
Base.metadata.create_all(bind=engine)