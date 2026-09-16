from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Use Supabase PostgreSQL if DATABASE_URL is set, otherwise SQLite for local dev
database_url = os.getenv("DATABASE_URL", "").strip()
if database_url and "postgresql" in database_url:
    # Use Supabase/PostgreSQL from environment
    DATABASE_URL = database_url
    engine = create_engine(DATABASE_URL)
else:
    # Fall back to SQLite for local development
    DATABASE_URL = "sqlite:///./stock_system.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
