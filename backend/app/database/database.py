# app/database/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL")  # e.g. postgresql://user:pass@localhost:5432/nodifyt

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency used inside FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()