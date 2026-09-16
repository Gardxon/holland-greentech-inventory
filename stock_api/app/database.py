from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Use Supabase PostgreSQL if DATABASE_URL is set and valid, otherwise SQLite
database_url = os.getenv("DATABASE_URL", "").strip()

# Only use PostgreSQL if DATABASE_URL is properly set and valid
if database_url and "postgresql" in database_url and database_url.startswith("postgresql://"):
    try:
        DATABASE_URL = database_url
        engine = create_engine(DATABASE_URL)
    except Exception as e:
        # If PostgreSQL fails, fall back to SQLite
        print(f"PostgreSQL connection failed, using SQLite: {e}")
        DATABASE_URL = "sqlite:///./stock_system.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Use SQLite by default
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
