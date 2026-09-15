from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Use SQLite by default (no external dependencies)
# Can override with DATABASE_URL env var if needed
database_url = os.getenv("DATABASE_URL", "").strip()
if not database_url or "postgresql" in database_url:
    # Force SQLite if no env var or if postgres URL found
    DATABASE_URL = "sqlite:///./stock_system.db"
else:
    DATABASE_URL = database_url

# SQLite requires check_same_thread=False
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
