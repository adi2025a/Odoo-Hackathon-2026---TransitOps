from fastapi import APIRouter, HTTPException, status , Depends
from typing import List

from requests import Session
from app.schemas.vehicle_schema import VehicleCreate, VehicleResponse, VehicleUpdate
from app.database.database import get_db

router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)


# 3. API Endpoints
@router.get("", response_model=List[VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    """Retrieve all vehicles from the database."""
    # Replace 'Vehicle' with your actual SQLAlchemy model class
    return db.query(Vehicle).all()


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    """Register a new vehicle. Enforces unique registration numbers."""
    
    # Business Rule: The vehicle registration number must be unique
    existing_vehicle = db.query(Vehicle).filter(Vehicle.registration_number == vehicle.registration_number).first()
    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle registration number must be unique."
        )
            
    db_vehicle = Vehicle(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.patch("/{id}", response_model=VehicleResponse)
def update_vehicle(id: int, vehicle_update: VehicleUpdate, db: Session = Depends(get_db)):
    """Partially update a vehicle's details."""
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    update_data = vehicle_update.model_dump(exclude_unset=True)
    
    # Business Rule validation check for uniqueness if registration number is changing
    if "registration_number" in update_data:
        duplicate_check = db.query(Vehicle).filter(
            Vehicle.registration_number == update_data["registration_number"],
            Vehicle.id != id
        ).first()
        if duplicate_check:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle registration number must be unique."
            )

    # Apply updates to the database record
    for key, value in update_data.items():
        setattr(db_vehicle, key, value)
        
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(id: int, db: Session = Depends(get_db)):
    """Delete a vehicle from the registry."""
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    db.delete(db_vehicle)
    db.commit()
    return None