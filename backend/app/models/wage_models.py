"""
app/models/wage_models.py
Pydantic v2 request/response models for the statutory wage and overtime engine
under Ethiopian Labour Proclamation No. 1156/2019.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class WageCalculationRequest(BaseModel):
    """Input payload for POST /api/v1/calculate-wage."""

    # Primary Input Variables per Proclamation 1156/2019 rules
    basic_monthly_pay: Optional[float] = Field(
        None,
        gt=0,
        description="Basic Monthly Pay in Ethiopian Birr (ETB).",
        examples=[10400.0],
    )
    monthly_hours_divisor: float = Field(
        208.0,
        gt=0,
        description="Monthly standard hours divisor (default: 208 hrs, 48 hrs/week per Art. 61).",
        examples=[208.0],
    )
    daytime_overtime_hours: float = Field(
        0.0,
        ge=0,
        description="Daytime overtime hours (6:00 AM – 10:00 PM, 1.5× rate, Art. 68(1)(a)).",
        examples=[4.0],
    )
    nighttime_overtime_hours: float = Field(
        0.0,
        ge=0,
        description="Nighttime overtime hours (10:00 PM – 6:00 AM, 1.75× rate, Art. 68(1)(b)).",
        examples=[2.0],
    )
    rest_day_overtime_hours: float = Field(
        0.0,
        ge=0,
        description="Weekly rest-day overtime hours (2.0× rate, Art. 68(1)(c)).",
        examples=[4.0],
    )
    public_holiday_overtime_hours: float = Field(
        0.0,
        ge=0,
        description="Public holiday overtime hours (2.5× rate, Art. 68(1)(d)).",
        examples=[8.0],
    )

    # Backward compatibility with earlier daily input schema
    daily_base_salary: Optional[float] = Field(
        None,
        gt=0,
        description="Legacy: Gross daily base salary in ETB (if basic_monthly_pay not provided).",
        examples=[500.0],
    )
    standard_overtime_hours: Optional[float] = Field(
        None,
        ge=0,
        description="Legacy: Hours of standard overtime.",
    )
    rest_day_hours: Optional[float] = Field(
        None,
        ge=0,
        description="Legacy: Hours worked on a rest day.",
    )


class CategoryBreakdownItem(BaseModel):
    multiplier: Optional[float] = None
    hours: Optional[float] = None
    hourly_rate: float
    subtotal: Optional[float] = None
    formula: str


class BaseHourlyRateItem(BaseModel):
    basic_monthly_pay: float
    monthly_hours: float
    hourly_rate: float
    formula: str


class DetailedWageBreakdown(BaseModel):
    """Category breakdown that MUST be output FIRST."""
    base_hourly_rate: BaseHourlyRateItem
    daytime_overtime: CategoryBreakdownItem
    nighttime_overtime: CategoryBreakdownItem
    weekly_rest_day_overtime: CategoryBreakdownItem
    public_holiday_overtime: CategoryBreakdownItem
    formatted_breakdown: str

    # Legacy fields
    standard_hours: int = 8
    standard_overtime_hours: float = 0.0
    rest_day_hours: float = 0.0
    overtime_multiplier: float = 1.5
    rest_day_multiplier: float = 2.0


class FinalCalculatedResults(BaseModel):
    """Final calculated totals that MUST be output SECOND."""
    total_overtime_pay: float
    gross_earnings: float


class WageCalculationResponse(BaseModel):
    """
    Full wage calculation response.
    Breakdown category is structured FIRST, final results SECOND.
    """
    # 1. Calculation Breakdown by Category (FIRST)
    breakdown: DetailedWageBreakdown

    # 2. Final Calculated Results (SECOND)
    final_results: FinalCalculatedResults

    # Top-level direct attributes & legacy support
    hourly_rate: float = Field(..., description="Hourly Base Rate = Basic Monthly Pay / Monthly Standard Hours")
    base_pay: float = Field(..., description="Basic Monthly Pay (or daily base pay)")
    standard_overtime_pay: float = Field(..., description="Daytime Overtime subtotal (1.5×)")
    nighttime_overtime_pay: float = Field(0.0, description="Nighttime Overtime subtotal (1.75×)")
    rest_day_pay: float = Field(..., description="Weekly Rest Day subtotal (2.0×)")
    public_holiday_pay: float = Field(0.0, description="Public Holiday subtotal (2.5×)")
    total_overtime_pay: float = Field(..., description="Sum of Overtime Subtotals")
    total_pay: float = Field(..., description="Gross Earnings (Basic + Overtime)")
    gross_earnings: float = Field(..., description="Gross Earnings (Basic + Overtime)")

    formatted_text: str = Field(..., description="Exact template-formatted breakdown and final result text.")
    legal_references: list[str] = Field(..., description="Ethiopian Labour Proclamation No. 1156/2019 citations.")
    warnings: list[str] = Field(default_factory=list, description="Statutory limit warnings.")
    disclaimer: str
    currency: str = Field("ETB", description="Currency of all monetary values.")
