from fastapi import APIRouter, Depends
from services.formula_service import formula_service

router = APIRouter(prefix="/api/formulas", tags=["formulas"])


@router.get("/")
async def list_formulas(category: str = None):
    if category:
        return formula_service.get_by_category(category)
    return formula_service.get_all_formulas()


@router.get("/categories")
async def list_categories():
    formulas = formula_service.get_all_formulas()
    categories = list(set(f["category"] for f in formulas))
    return categories


@router.post("/calculate")
async def calculate_formula(name: str, inputs: dict):
    return formula_service.calculate(name, **inputs)
