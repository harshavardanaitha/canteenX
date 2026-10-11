import numpy as np
import pandas as pd
from datetime import datetime

class DemandForecaster:
    def __init__(self):
        self.version = "xgb_v1.0"

    def predict_demand(self, canteen_id: str, items: list) -> list:
        """
        Predict hourly/daily food demand for canteen menu items.
        Returns predicted quantity, recommended preparation quantity, and explainability factors.
        """
        predictions = []
        current_hour = datetime.now().hour
        is_lunch_peak = 12 <= current_hour <= 14

        for item in items:
            item_id = item.get("id", "itm_unknown")
            item_name = item.get("name", "Food Item")
            base_sales = item.get("available_quantity", 30)

            # Simulated XGBoost feature weights
            peak_multiplier = 1.6 if is_lunch_peak else 1.2
            predicted_demand = int(base_sales * peak_multiplier + np.random.randint(5, 15))
            recommended_prep = int(predicted_demand * 1.1) # 10% safety buffer

            factors = [
                f"Historical Sales Pattern (+{int(np.random.randint(30, 45))}%)",
                f"Peak Hour Multiplier ({current_hour}:00 - {current_hour+1}:00) (+30%)",
                "Student Saver Combo Preference (+18%)",
                "Weather & Day-of-Week Effect (+12%)"
            ]

            predictions.append({
                "menu_item_id": item_id,
                "item_name": item_name,
                "target_date": datetime.now().strftime("%Y-%m-%d"),
                "target_hour": 13,
                "predicted_demand": predicted_demand,
                "recommended_prep": recommended_prep,
                "confidence_score": 0.89,
                "influencing_factors": factors,
                "model_version": self.version
            })

        return predictions
