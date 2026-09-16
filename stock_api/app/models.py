from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    location = Column(String)
    branch_type = Column(String)  # "warehouse" or "sub_branch"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory_levels = relationship("InventoryLevel", back_populates="branch", cascade="all, delete-orphan")
    stock_movements_from = relationship("StockMovement", foreign_keys="StockMovement.from_branch_id", back_populates="from_branch")
    stock_movements_to = relationship("StockMovement", foreign_keys="StockMovement.to_branch_id", back_populates="to_branch")
    users = relationship("User", back_populates="branch")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True, index=True)
    pack_size = Column(String, nullable=True)
    unit_price = Column(Float)
    reorder_level = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory_levels = relationship("InventoryLevel", back_populates="product", cascade="all, delete-orphan")
    stock_movements = relationship("StockMovement", back_populates="product")

class InventoryLevel(Base):
    __tablename__ = "inventory_levels"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    quantity_on_hand = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    branch = relationship("Branch", back_populates="inventory_levels")
    product = relationship("Product", back_populates="inventory_levels")

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    from_branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True, index=True)
    to_branch_id = Column(Integer, ForeignKey("branches.id"), index=True)
    quantity = Column(Integer)
    movement_type = Column(String)  # "transfer", "sale", "receipt", "adjustment"
    reference_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    product = relationship("Product", back_populates="stock_movements")
    from_branch = relationship("Branch", foreign_keys=[from_branch_id], back_populates="stock_movements_from")
    to_branch = relationship("Branch", foreign_keys=[to_branch_id], back_populates="stock_movements_to")
    user = relationship("User", back_populates="stock_movements")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    branch = relationship("Branch", back_populates="users")
    stock_movements = relationship("StockMovement", back_populates="user")
    sales = relationship("Sales", back_populates="user")
    stock_requests = relationship("StockRequest", back_populates="created_by_user")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact = Column(String)
    location = Column(String, nullable=True)
    category = Column(String, index=True)  # Farmer, Agrovet, Plant Raiser, Company
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    sales = relationship("Sales", back_populates="customer")

class Sales(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    quantity_sold = Column(Integer)
    unit_price = Column(Float)
    total_amount = Column(Float)
    payment_method = Column(String, default="cash")  # cash, mpesa, bank
    currency = Column(String, default="TSH")  # TSH, EUR
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    product = relationship("Product")
    branch = relationship("Branch")
    customer = relationship("Customer", back_populates="sales")
    user = relationship("User", back_populates="sales")

class StockRequest(Base):
    __tablename__ = "stock_requests"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    from_branch_id = Column(Integer, ForeignKey("branches.id"), index=True)
    to_branch_id = Column(Integer, ForeignKey("branches.id"), index=True)
    quantity = Column(Integer)
    request_type = Column(String, default="request")  # "request" or "return"
    status = Column(String, default="pending")  # pending, approved, rejected, fulfilled
    reason = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product")
    from_branch = relationship("Branch", foreign_keys=[from_branch_id])
    to_branch = relationship("Branch", foreign_keys=[to_branch_id])
    created_by_user = relationship("User", back_populates="stock_requests")
