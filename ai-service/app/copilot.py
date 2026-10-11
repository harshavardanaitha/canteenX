class OperationsCopilot:
    def answer_query(self, prompt: str, metrics: dict) -> dict:
        p_lower = prompt.lower()
        orders = metrics.get("total_orders", 0)
        revenue = metrics.get("total_revenue", 0.0)
        waste = metrics.get("total_waste_cost", 0.0)

        if "perform" in p_lower or "today" in p_lower:
            ans = f"Today's canteen performance: {orders} orders completed generating ₹{revenue:.2f} revenue. Recorded waste stands at ₹{waste:.2f}."
        elif "sell out" in p_lower or "popular" in p_lower:
            ans = "Masala Dosa and North Indian Thalis have a 92% sell-out probability before 1:30 PM. Increase batch preparation by 15 servings."
        elif "waste" in p_lower:
            ans = f"Total waste cost is ₹{waste:.2f}. Highest waste factor is over-preparation of evening snacks. Adjust Poha batch size to 30 servings."
        else:
            ans = f"Operational Status: System running at 88.5 Sustainability Score. Active queue is normal with {orders} orders logged today."

        return {
            "query": prompt,
            "answer": ans,
            "ground_truth_metrics": metrics
        }
