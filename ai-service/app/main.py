from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from app.demand_forecaster import DemandForecaster
from app.queue_estimator import QueueEstimator
from app.inventory_predictor import InventoryPredictor
from app.copilot import OperationsCopilot

app = FastAPI(
    title="CanteenX AI Microservice",
    description="Machine Learning service for Food Demand Forecasting, Queue Estimation, and AI Operations Copilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

demand_forecaster = DemandForecaster()
queue_estimator = QueueEstimator()
inventory_predictor = InventoryPredictor()
copilot_engine = OperationsCopilot()

class CopilotRequest(BaseModel):
    prompt: str
    metrics: Optional[dict] = {}

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "CanteenX AI Microservice"}

@app.get("/api/predictions/demand")
def get_demand_predictions(canteen_id: str = Query("cnt_main")):
    demo_items = [
        {"id": "itm_dosa", "name": "Masala Dosa", "available_quantity": 45},
        {"id": "itm_thali", "name": "Executive North Indian Thali", "available_quantity": 25},
        {"id": "itm_biryani", "name": "Hyderabadi Paneer Dum Biryani", "available_quantity": 40},
        {"id": "itm_friedrice", "name": "Veg Schezwan Fried Rice", "available_quantity": 35}
    ]
    predictions = demand_forecaster.predict_demand(canteen_id, demo_items)
    return {"canteen_id": canteen_id, "predictions": predictions}

@app.get("/api/predictions/queue")
def get_queue_prediction(canteen_id: str = Query("cnt_main"), active_orders: int = Query(6), staff_on_duty: int = Query(4)):
    return queue_estimator.estimate_wait_time(active_orders, staff_on_duty)

@app.post("/api/copilot/query")
def process_copilot_query(req: CopilotRequest):
    return copilot_engine.answer_query(req.prompt, req.metrics or {})
