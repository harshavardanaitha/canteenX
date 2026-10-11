# CanteenX AI & ML Specification

## Overview
CanteenX features a dedicated Python FastAPI service (`ai-service/`) that provides machine learning inference, statistical forecasting, heuristic fallbacks, and natural language analytics copilot support.

## Core Models & Algorithms

### 1. Demand Forecasting (`demand_forecaster.py`)
- **Model**: Gradient-boosted regression via `XGBoost` & `Scikit-learn RandomForestRegressor`.
- **Features**: Day of week, hour of day, historical order volume, menu price, dish popularity, campus event flags.
- **Output**: Predicted item demand (e.g. 86 servings) + recommended kitchen preparation quantity (e.g. 90 servings).
- **Explainability**: Returns feature importance weights (e.g., `+ Lunch Peak (40%)`, `+ Friday Pattern (25%)`, `+ Historical Average (20%)`).

### 2. Queue & Wait-Time Estimator (`queue_estimator.py`)
- **Method**: Hybrid ML model + Rule-based fallback.
- **Calculation**:
  $$\text{Wait Time} = \frac{\text{Active Orders} \times \text{Average Dish Prep Mins}}{\text{Staff Count on Duty}} \times \text{Complexity Factor}$$
- **Fallback**: When historical dataset $< 50$ orders, executes transparent deterministic queue calculation.

### 3. Predictive Inventory Alert Engine (`inventory_predictor.py`)
- **Calculation**: Projects required ingredient quantities for next 24-48 hours based on demand predictions and alerts managers before stockouts occur.

### 4. Personalized Recommendation Engine (`recommendation_engine.py`)
- **Algorithm**: Content-based + Collaborative filtering based on user order history, time of day, popular dishes, and prep speed.

### 5. AI Operations Copilot (`copilot_engine.py`)
- **RAG Analytics**: Answers manager natural language queries ("Which item might sell out today?", "Why is the queue high?") by executing ground-truth SQL analytical summaries.
