#!/usr/bin/env python
"""Initialize customers table in database"""
from sqlalchemy import create_engine, text
from app.models import Customer, Base

DATABASE_URL = "postgresql://postgres:kawandali@localhost:5432/stock_db"
engine = create_engine(DATABASE_URL)

# Create all tables (will only create if they don't exist)
Base.metadata.create_all(bind=engine)

print("✅ Customers table created successfully!")
print("You can now use the customer management features.")
