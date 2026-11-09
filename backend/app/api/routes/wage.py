"""
app/api/routes/wage.py
REST endpoint for statutory wage and overtime calculation
under Ethiopian Labour Proclamation No. 1156/2019.
"""

from fastapi import APIRouter, HTTPException, status

from app.core.wage_calculator import WageCalculator
from app.models.wage_models import (
    WageCalculationRequest,
    WageCalculationResponse,
)

router = APIRouter()
_calculator = WageCalculator()


@router.post(
    "/calculate-wage",
    response_model=WageCalculationResponse,
    summary="Calculate Statutory Wage & Overtime Pay",
    description=(
        "Computes statutory wage and overtime pay under Ethiopian Labour Proclamation No. 1156/2019. "
        "Outputs Category Breakdown FIRST, and Final Calculated Results SECOND. "
        "Uses 208 hours/month as standard divisor."
    ),
    status_code=status.HTTP_200_OK,
)
async def calculate_wage(request: WageCalculationRequest) -> WageCalculationResponse:
    """
    Compute category breakdown (1.5x, 1.75x, 2.0x, 2.5x) and final gross earnings.

    - **basic_monthly_pay**: Basic Monthly Pay in ETB (or daily_base_salary)
    - **monthly_hours_divisor**: Standard hours per month divisor (default: 208)
    - **daytime_overtime_hours**: 6:00 AM – 10:00 PM (1.5×)
    - **nighttime_overtime_hours**: 10:00 PM – 6:00 AM (1.75×)
    - **rest_day_overtime_hours**: Weekly Rest Day (2.0×)
    - **public_holiday_overtime_hours**: Public Holiday (2.5×)
    """
    try:
        result = _calculator.calculate(
            basic_monthly_pay=request.basic_monthly_pay,
            monthly_hours_divisor=request.monthly_hours_divisor,
            daytime_overtime_hours=request.daytime_overtime_hours,
            nighttime_overtime_hours=request.nighttime_overtime_hours,
            rest_day_overtime_hours=request.rest_day_overtime_hours,
            public_holiday_overtime_hours=request.public_holiday_overtime_hours,
            # Legacy inputs
            daily_base_salary=request.daily_base_salary,
            standard_overtime_hours=request.standard_overtime_hours,
            rest_day_hours=request.rest_day_hours,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    return WageCalculationResponse(**result)
