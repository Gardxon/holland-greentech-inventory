#!/usr/bin/env python
"""Migrate database to add customer_id to sales table"""
from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

engine = create_engine(DATABASE_URL)

with engine.begin() as connection:
    # Check if column exists
    result = connection.execute(text("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='sales' AND column_name='customer_id'
        )
    """))

    column_exists = result.scalar()

    if not column_exists:
        print("Adding customer_id column to sales table...")
        connection.execute(text("""
            ALTER TABLE sales
            ADD COLUMN customer_id INTEGER REFERENCES customers(id);
        """))
        print("[OK] customer_id column added successfully!")
    else:
        print("[OK] customer_id column already exists")

print("Migration complete!")
