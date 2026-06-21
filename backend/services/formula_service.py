from typing import Dict, List
import json


class FormulaService:
    def __init__(self):
        self.formulas = self._load_formulas()

    def _load_formulas(self) -> List[Dict]:
        return [
            {
                "name": "Cost Performance Index (CPI)",
                "formula": "CPI = EV / AC",
                "description": "Measures cost efficiency. CPI > 1 = under budget, CPI < 1 = over budget",
                "category": "evm",
                "variables": {"EV": "Earned Value", "AC": "Actual Cost"},
                "example": "EV = $80,000, AC = $100,000 → CPI = 0.8 (over budget)",
                "tips": "Remember: CPI > 1 is good (getting more value per dollar spent)",
            },
            {
                "name": "Schedule Performance Index (SPI)",
                "formula": "SPI = EV / PV",
                "description": "Measures schedule efficiency. SPI > 1 = ahead of schedule",
                "category": "evm",
                "variables": {"EV": "Earned Value", "PV": "Planned Value"},
                "example": "EV = $80,000, PV = $70,000 → SPI = 1.14 (ahead of schedule)",
                "tips": "SPI > 1 is good (completing work faster than planned)",
            },
            {
                "name": "Cost Variance (CV)",
                "formula": "CV = EV - AC",
                "description": "Positive = under budget, Negative = over budget",
                "category": "evm",
                "variables": {"EV": "Earned Value", "AC": "Actual Cost"},
                "example": "EV = $80,000, AC = $75,000 → CV = +$5,000 (under budget)",
                "tips": "CV is in dollars, CPI is a ratio. Both use EV and AC.",
            },
            {
                "name": "Schedule Variance (SV)",
                "formula": "SV = EV - PV",
                "description": "Positive = ahead of schedule, Negative = behind schedule",
                "category": "evm",
                "variables": {"EV": "Earned Value", "PV": "Planned Value"},
                "example": "EV = $80,000, PV = $70,000 → SV = +$10,000 (ahead)",
                "tips": "SV is in dollars, SPI is a ratio. Both use EV and PV.",
            },
            {
                "name": "Estimate at Completion (EAC)",
                "formula": "EAC = BAC / CPI",
                "description": "Projected total cost based on current performance",
                "category": "evm",
                "variables": {"BAC": "Budget at Completion", "CPI": "Cost Performance Index"},
                "example": "BAC = $500,000, CPI = 0.8 → EAC = $625,000",
                "tips": "This assumes current cost performance continues",
            },
            {
                "name": "Estimate to Complete (ETC)",
                "formula": "ETC = EAC - AC",
                "description": "How much more money is needed to complete the project",
                "category": "evm",
                "variables": {"EAC": "Estimate at Completion", "AC": "Actual Cost"},
                "example": "EAC = $625,000, AC = $200,000 → ETC = $425,000",
                "tips": "ETC is the remaining cost, EAC is the total projected cost",
            },
            {
                "name": "Variance at Completion (VAC)",
                "formula": "VAC = BAC - EAC",
                "description": "Projected budget surplus/deficit at completion",
                "category": "evm",
                "variables": {"BAC": "Budget at Completion", "EAC": "Estimate at Completion"},
                "example": "BAC = $500,000, EAC = $625,000 → VAC = -$125,000 (over budget)",
                "tips": "Negative VAC means you'll exceed the budget",
            },
            {
                "name": "To-Complete Performance Index (TCPI)",
                "formula": "TCPI = (BAC - EV) / (BAC - AC)",
                "description": "Required performance to finish on budget",
                "category": "evm",
                "variables": {"BAC": "Budget at Completion", "EV": "Earned Value", "AC": "Actual Cost"},
                "example": "BAC = $500K, EV = $200K, AC = $250K → TCPI = 2.0 (very difficult)",
                "tips": "TCPI > 1 means you need to be more efficient than planned",
            },
            {
                "name": "Critical Path Duration",
                "formula": "CP = longest path through network diagram",
                "description": "The longest sequence of activities determining project duration",
                "category": "schedule",
                "variables": {"ES": "Early Start", "EF": "Early Finish", "LS": "Late Start", "LF": "Late Finish"},
                "example": "If paths are A→B→D (10 days) and A→C→D (8 days), CP = 10 days",
                "tips": "Critical path has zero float/slack",
            },
            {
                "name": "Total Float",
                "formula": "TF = LS - ES = LF - EF",
                "description": "Amount of time an activity can be delayed without delaying the project",
                "category": "schedule",
                "variables": {"LS": "Late Start", "ES": "Early Start", "LF": "Late Finish", "EF": "Early Finish"},
                "example": "ES = 5, LS = 8 → TF = 3 days of float",
                "tips": "Activities on the critical path have TF = 0",
            },
            {
                "name": "Free Float",
                "formula": "FF = ES(successor) - EF(current) - 1",
                "description": "Time an activity can be delayed without delaying the next activity",
                "category": "schedule",
                "variables": {"ES": "Early Start of successor", "EF": "Early Finish of current"},
                "example": "ES(successor) = 10, EF(current) = 7 → FF = 2 days",
                "tips": "Free float ≤ Total float",
            },
            {
                "name": "Expected Value (EMV)",
                "formula": "EMV = Probability × Impact",
                "description": "Expected monetary value of a risk event",
                "category": "risk",
                "variables": {"P": "Probability of occurrence", "I": "Impact in dollars"},
                "example": "P = 30%, Impact = $100,000 → EMV = $30,000",
                "tips": "Used in quantitative risk analysis. Positive EMV = opportunity.",
            },
            {
                "name": "Standard Deviation (Risk)",
                "formula": "σ = (Pessimistic - Optimistic) / 6",
                "description": "Measures uncertainty in three-point estimates",
                "category": "risk",
                "variables": {"P": "Pessimistic estimate", "O": "Optimistic estimate"},
                "example": "P = 30 days, O = 10 days → σ = 3.33 days",
                "tips": "Used in PERT analysis. 68% within ±1σ, 95% within ±2σ, 99.7% within ±3σ",
            },
            {
                "name": "PERT Estimate",
                "formula": "TE = (O + 4M + P) / 6",
                "description": "Weighted average of three-point estimates",
                "category": "risk",
                "variables": {"O": "Optimistic", "M": "Most Likely", "P": "Pessimistic"},
                "example": "O=10, M=15, P=30 → TE = (10+60+30)/6 = 16.67 days",
                "tips": "M is weighted 4x because it's most likely",
            },
            {
                "name": "Point of Total Assumption (PTA)",
                "formula": "PTA = ((Ceiling Price - Target Price) / Buyer Share) + Target Cost",
                "description": "Cost at which the seller absorbs all additional costs",
                "category": "procurement",
                "variables": {"CP": "Ceiling Price", "TP": "Target Price", "BS": "Buyer Share Ratio", "TC": "Target Cost"},
                "example": "CP=$120K, TP=$100K, BS=80%, TC=$80K → PTA=$105K",
                "tips": "PTA is where the seller starts losing money",
            },
            {
                "name": "Communication Channels",
                "formula": "N(N-1)/2",
                "description": "Number of communication channels in a team",
                "category": "communication",
                "variables": {"N": "Number of people/team members"},
                "example": "10 people → 10(9)/2 = 45 communication channels",
                "tips": "Each new person adds N new channels (N = current team size)",
            },
            {
                "name": "Return on Investment (ROI)",
                "formula": "ROI = (Net Profit / Cost of Investment) × 100",
                "description": "Percentage return on project investment",
                "category": "business",
                "variables": {"NP": "Net Profit", "CI": "Cost of Investment"},
                "example": "Profit = $50K, Cost = $200K → ROI = 25%",
                "tips": "Higher ROI = better investment. Used in business case analysis.",
            },
            {
                "name": "Present Value (PV)",
                "formula": "PV = FV / (1 + r)^n",
                "description": "Current value of a future sum of money",
                "category": "business",
                "variables": {"FV": "Future Value", "r": "Discount rate", "n": "Number of periods"},
                "example": "FV=$100K, r=10%, n=5 → PV = $62,092",
                "tips": "Money today is worth more than the same amount in the future",
            },
            {
                "name": "Internal Rate of Return (IRR)",
                "formula": "NPV = Σ(CFt / (1+IRR)^t) = 0",
                "description": "Discount rate where NPV = 0",
                "category": "business",
                "variables": {"CF": "Cash Flow", "t": "Time period"},
                "example": "If IRR > cost of capital, accept the project",
                "tips": "Higher IRR = more desirable project",
            },
        ]

    def get_all_formulas(self) -> List[Dict]:
        return self.formulas

    def get_by_category(self, category: str) -> List[Dict]:
        return [f for f in self.formulas if f["category"] == category]

    def calculate(self, formula_name: str, **kwargs) -> Dict:
        calculators = {
            "Cost Performance Index (CPI)": lambda ev, ac: ev / ac if ac else 0,
            "Schedule Performance Index (SPI)": lambda ev, pv: ev / pv if pv else 0,
            "Cost Variance (CV)": lambda ev, ac: ev - ac,
            "Schedule Variance (SV)": lambda ev, pv: ev - pv,
            "Estimate at Completion (EAC)": lambda bac, cpi: bac / cpi if cpi else 0,
            "Estimate to Complete (ETC)": lambda eac, ac: eac - ac,
            "Variance at Completion (VAC)": lambda bac, eac: bac - eac,
            "Communication Channels": lambda n: n * (n - 1) / 2,
            "Expected Value (EMV)": lambda probability, impact: probability * impact,
            "Point of Total Assumption (PTA)": lambda ceiling_price, target_price, buyer_share, target_cost: ((ceiling_price - target_price) / buyer_share) + target_cost if buyer_share else 0,
            "Return on Investment (ROI)": lambda net_profit, cost: (net_profit / cost) * 100 if cost else 0,
            "Present Value (PV)": lambda fv, r, n: fv / ((1 + r) ** n) if r != -1 else 0,
            "PERT Estimate": lambda o, m, p: (o + 4 * m + p) / 6,
            "Standard Deviation (Risk)": lambda p, o: (p - o) / 6 if p != o else 0,
        }
        calc = calculators.get(formula_name)
        if calc:
            try:
                result = calc(**kwargs)
                return {"formula": formula_name, "result": round(result, 4), "inputs": kwargs}
            except Exception as e:
                return {"formula": formula_name, "error": str(e), "inputs": kwargs}
        return {"formula": formula_name, "error": "Calculator not available"}


formula_service = FormulaService()
