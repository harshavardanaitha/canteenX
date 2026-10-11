class InventoryPredictor:
    def predict_stockouts(self, inventory_items: list) -> list:
        alerts = []
        for item in inventory_items:
            stock = float(item.get("current_stock", 0))
            min_thresh = float(item.get("min_stock_threshold", 10))
            predicted_usage = min_thresh * 1.6

            if stock < predicted_usage:
                alerts.append({
                    "ingredient_name": item.get("ingredient_name", "Ingredient"),
                    "current_stock": stock,
                    "unit": item.get("unit", "units"),
                    "predicted_24h_requirement": round(predicted_usage, 2),
                    "alert_level": "WARNING" if stock > min_thresh else "CRITICAL",
                    "recommendation": f"Order at least {round(predicted_usage - stock + 10, 2)} {item.get('unit')} before tomorrow's lunch peak."
                })
        return alerts
