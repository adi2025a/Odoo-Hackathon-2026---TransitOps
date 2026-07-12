from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

# 1. Enums and Pydantic Schemas
class VehicleStatus(str, Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"

class VehicleBase(BaseModel):
    registration_number: str = Field(..., description="Must be unique")
    vehicle_name: str
    type: str
    max_load_capacity: float = Field(..., gt=0, description="Capacity in kg")
    odometer: float = Field(..., ge=0)
    acquisition_cost: float = Field(..., ge=0)
    status: VehicleStatus = VehicleStatus.AVAILABLE

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    vehicle_name: Optional[str] = None
    type: Optional[str] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None
    status: Optional[VehicleStatus] = None

class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True