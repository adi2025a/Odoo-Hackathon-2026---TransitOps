from sqlalchemy import Column, Integer, String, Float, Enum as SQLEnum
import enum
from database.database import Base  # Adjust import path based on your directory structure

# Define a Python Enum for the status to restrict database entries
class VehicleStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    
    # The vehicle registration number must be unique
    registration_number = Column(String, unique=True, index=True, nullable=False)
    
    vehicle_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    max_load_capacity = Column(Float, nullable=False)  # in kg
    odometer = Column(Float, default=0.0, nullable=False)
    acquisition_cost = Column(Float, nullable=False)
    
    # Store the status as a string matching the Enum values
    status = Column(
        String, 
        default=VehicleStatus.AVAILABLE.value, 
        nullable=False
    )