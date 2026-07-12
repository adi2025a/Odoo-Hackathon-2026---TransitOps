from fastapi import APIRouter, HTTPException, status
from typing import List
from schemas.vehicle_schema import VehicleCreate, VehicleResponse, VehicleUpdate

router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)



# 2. Mock In-Memory Database (Replace this with your actual database logic)
mock_db = {}
id_counter = 1

# 3. API Endpoints

@router.get("", response_model=List[VehicleResponse])
def get_vehicles():
    """Retrieve all vehicles."""
    return list(mock_db.values())


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: VehicleCreate):
    """Register a new vehicle. Enforces unique registration numbers."""
    global id_counter
    
    # Business Rule: The vehicle registration number must be unique
    for existing_vehicle in mock_db.values():
        if existing_vehicle["registration_number"] == vehicle.registration_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle registration number must be unique."
            )
            
    new_vehicle = vehicle.model_dump()
    new_vehicle["id"] = id_counter
    mock_db[id_counter] = new_vehicle
    id_counter += 1
    return new_vehicle


@router.patch("/{id}", response_model=VehicleResponse)
def update_vehicle(id: int, vehicle_update: VehicleUpdate):
    """Partially update a vehicle's details."""
    if id not in mock_db:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    current_vehicle = mock_db[id]
    update_data = vehicle_update.model_dump(exclude_unset=True)
    
    # Business Rule validation check for uniqueness if registration number is being modified
    if "registration_number" in update_data:
        for vid, existing_vehicle in mock_db.items():
            if vid != id and existing_vehicle["registration_number"] == update_data["registration_number"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Vehicle registration number must be unique."
                )

    # Apply updates
    for key, value in update_data.items():
        current_vehicle[key] = value
        
    mock_db[id] = current_vehicle
    return current_vehicle


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(id: int):
    """Delete a vehicle from the registry."""
    if id not in mock_db:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    del mock_db[id]
    return None