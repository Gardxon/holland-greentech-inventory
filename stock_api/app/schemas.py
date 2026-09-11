from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BranchBase(BaseModel):
    name: str
    location: str
    branch_type: str

class BranchCreate(BranchBase):
    pass

class Branch(BranchBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    pack_size: Optional[str] = None
    unit_price: float
    reorder_level: int = 10

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    pack_size: Optional[str] = None
    unit_price: Optional[float] = None
    reorder_level: Optional[int] = None
    is_active: Optional[bool] = None

class Product(ProductBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class InventoryLevelBase(BaseModel):
    quantity_on_hand: int

class InventoryLevel(InventoryLevelBase):
    id: int
    branch_id: int
    product_id: int
    last_updated: datetime

    class Config:
        from_attributes = True

class InventoryLevelWithProduct(BaseModel):
    id: int
    branch_id: int
    product_id: int
    quantity_on_hand: int
    last_updated: datetime
    product_sku: str
    product_name: str
    product_price: float
    stock_value: float

    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    name: str
    contact: str
    location: Optional[str] = None
    category: str  # Farmer, Agrovet, Plant Raiser, Company

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SalesBase(BaseModel):
    product_id: int
    branch_id: int
    customer_id: Optional[int] = None
    quantity_sold: int
    unit_price: float
    payment_method: str = "cash"  # cash, mpesa, bank
    currency: str = "TSH"  # TSH, EUR
    notes: Optional[str] = None

class SalesCreate(SalesBase):
    pass

class Sales(SalesBase):
    id: int
    total_amount: float
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class StockRequestBase(BaseModel):
    product_id: int
    from_branch_id: int
    to_branch_id: int
    quantity: int
    reason: Optional[str] = None

class StockRequestCreate(StockRequestBase):
    pass

class StockRequest(StockRequestBase):
    id: int
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StockMovementBase(BaseModel):
    product_id: int
    from_branch_id: Optional[int] = None
    to_branch_id: int
    quantity: int
    movement_type: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class StockMovementCreate(StockMovementBase):
    pass

class StockMovement(StockMovementBase):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str
    branch_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True
