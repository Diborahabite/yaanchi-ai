"""
tests/test_wage_calculator.py
Unit tests for the Statutory Wage and Overtime Pay Calculation Engine
under Ethiopian Labour Proclamation No. 1156/2019.
"""

import pytest
from app.core.wage_calculator import (
    DEFAULT_MONTHLY_HOURS,
    DAYTIME_OVERTIME_MULTIPLIER,
    NIGHTTIME_OVERTIME_MULTIPLIER,
    REST_DAY_MULTIPLIER,
    PUBLIC_HOLIDAY_MULTIPLIER,
    WageCalculator,
)


@pytest.fixture
def calc() -> WageCalculator:
    return WageCalculator()


# ---------------------------------------------------------------------------
# Core Rule Tests per Prompt Specification
# ---------------------------------------------------------------------------

def test_default_hourly_rate_with_208_hours(calc: WageCalculator) -> None:
    """Hourly Base Rate = Basic Monthly Pay / 208 hours (default)."""
    # 10,400 ETB / 208 hrs = 50.00 ETB/hr
    result = calc.calculate(basic_monthly_pay=10400.0)
    assert result["hourly_rate"] == 50.0
    assert result["base_pay"] == 10400.0
    assert result["total_overtime_pay"] == 0.0
    assert result["gross_earnings"] == 10400.0


def test_custom_monthly_hours_divisor(calc: WageCalculator) -> None:
    """If specified, uses the custom monthly hours divisor."""
    # 10,000 ETB / 200 hrs = 50.00 ETB/hr
    result = calc.calculate(basic_monthly_pay=10000.0, monthly_hours_divisor=200.0)
    assert result["hourly_rate"] == 50.0


def test_daytime_overtime_1_5x(calc: WageCalculator) -> None:
    """Daytime Overtime (6:00 AM – 10:00 PM): 1.5× rate."""
    # Rate = 50.0 ETB/hr; 4 hrs * 50 * 1.5 = 300.0 ETB
    result = calc.calculate(basic_monthly_pay=10400.0, daytime_overtime_hours=4.0)
    assert result["standard_overtime_pay"] == 300.0
    assert result["total_overtime_pay"] == 300.0
    assert result["gross_earnings"] == 10700.0


def test_nighttime_overtime_1_75x(calc: WageCalculator) -> None:
    """Nighttime Overtime (10:00 PM – 6:00 AM): 1.75× rate."""
    # Rate = 50.0 ETB/hr; 2 hrs * 50 * 1.75 = 175.0 ETB
    result = calc.calculate(basic_monthly_pay=10400.0, nighttime_overtime_hours=2.0)
    assert result["nighttime_overtime_pay"] == 175.0
    assert result["total_overtime_pay"] == 175.0
    assert result["gross_earnings"] == 10575.0


def test_weekly_rest_day_overtime_2_0x(calc: WageCalculator) -> None:
    """Weekly Rest Day Overtime: 2.0× rate."""
    # Rate = 50.0 ETB/hr; 3 hrs * 50 * 2.0 = 300.0 ETB
    result = calc.calculate(basic_monthly_pay=10400.0, rest_day_overtime_hours=3.0)
    assert result["rest_day_pay"] == 300.0
    assert result["total_overtime_pay"] == 300.0
    assert result["gross_earnings"] == 10700.0


def test_public_holiday_overtime_2_5x(calc: WageCalculator) -> None:
    """Public Holiday Overtime: 2.5× rate."""
    # Rate = 50.0 ETB/hr; 4 hrs * 50 * 2.5 = 500.0 ETB
    result = calc.calculate(basic_monthly_pay=10400.0, public_holiday_overtime_hours=4.0)
    assert result["public_holiday_pay"] == 500.0
    assert result["total_overtime_pay"] == 500.0
    assert result["gross_earnings"] == 10900.0


def test_all_categories_combined(calc: WageCalculator) -> None:
    """All 4 categories calculated simultaneously with breakdown and total."""
    # Rate = 10,400 / 208 = 50.0 ETB/hr
    # Daytime (1.5x) 2 hrs: 150.0 ETB
    # Nighttime (1.75x) 2 hrs: 175.0 ETB
    # Rest Day (2.0x) 2 hrs: 200.0 ETB
    # Public Holiday (2.5x) 2 hrs: 250.0 ETB
    # Total OT = 150 + 175 + 200 + 250 = 775.0 ETB
    # Gross = 10,400 + 775 = 11,175.0 ETB
    result = calc.calculate(
        basic_monthly_pay=10400.0,
        daytime_overtime_hours=2.0,
        nighttime_overtime_hours=2.0,
        rest_day_overtime_hours=2.0,
        public_holiday_overtime_hours=2.0,
    )
    assert result["hourly_rate"] == 50.0
    assert result["standard_overtime_pay"] == 150.0
    assert result["nighttime_overtime_pay"] == 175.0
    assert result["rest_day_pay"] == 200.0
    assert result["public_holiday_pay"] == 250.0
    assert result["total_overtime_pay"] == 775.0
    assert result["gross_earnings"] == 11175.0


def test_response_order_breakdown_first_final_results_second(calc: WageCalculator) -> None:
    """MANDATORY ORDER: breakdown FIRST, final_results SECOND."""
    result = calc.calculate(basic_monthly_pay=8320.0, daytime_overtime_hours=2.0)
    keys = list(result.keys())
    assert keys[0] == "breakdown"
    assert keys[1] == "final_results"
    assert "base_hourly_rate" in result["breakdown"]
    assert "total_overtime_pay" in result["final_results"]


def test_formatted_template_output(calc: WageCalculator) -> None:
    """OUTPUT FORMAT TEMPLATE verification."""
    result = calc.calculate(
        basic_monthly_pay=10400.0,
        daytime_overtime_hours=2.0,
        nighttime_overtime_hours=1.0,
    )
    text = result["formatted_text"]
    assert "#### 1. Calculation Breakdown by Category" in text
    assert "* Base Hourly Rate:" in text
    assert "10400.00 ETB ÷ 208.00 hrs = 50.00 ETB/hr" in text
    assert "* Daytime Overtime (1.5×):" in text
    assert "* Nighttime Overtime (1.75×):" in text
    assert "* Weekly Rest Day Overtime (2.0×):" in text
    assert "* Public Holiday Overtime (2.5×):" in text
    assert "#### 2. Final Calculated Results" in text
    assert "* Total Overtime Pay:" in text
    assert "* Gross Earnings (Basic + Overtime):" in text


# ---------------------------------------------------------------------------
# Legacy Compatibility Tests
# ---------------------------------------------------------------------------

def test_legacy_daily_base_salary(calc: WageCalculator) -> None:
    """Legacy daily_base_salary works transparently."""
    result = calc.calculate(daily_base_salary=400.0, standard_overtime_hours=2.0, rest_day_hours=1.0)
    assert result["hourly_rate"] == 50.0
    assert result["standard_overtime_pay"] == 150.0  # 50 * 1.5 * 2
    assert result["rest_day_pay"] == 100.0           # 50 * 2.0 * 1
    assert result["total_overtime_pay"] == 250.0
    assert result["total_pay"] == 650.0              # 400 base + 250 ot


# ---------------------------------------------------------------------------
# Validation Tests
# ---------------------------------------------------------------------------

def test_raises_on_zero_pay(calc: WageCalculator) -> None:
    with pytest.raises(ValueError):
        calc.calculate(basic_monthly_pay=0.0)


def test_raises_on_negative_hours(calc: WageCalculator) -> None:
    with pytest.raises(ValueError):
        calc.calculate(basic_monthly_pay=5000.0, daytime_overtime_hours=-1.0)


def test_statutory_overtime_warnings(calc: WageCalculator) -> None:
    """Art. 70 warning when daily overtime exceeds 2 hours."""
    result = calc.calculate(basic_monthly_pay=6000.0, daytime_overtime_hours=3.5)
    assert len(result["warnings"]) >= 1
    assert "Art. 70" in result["warnings"][0]
