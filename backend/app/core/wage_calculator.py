"""
app/core/wage_calculator.py
Statutory Wage and Overtime Pay Calculation Engine
under Ethiopian Labour Proclamation No. 1156/2019.

Rules & Constants:
- Standard Monthly Hours Divisor: 208 hours (48 hrs/week per Art. 61)
- Hourly Base Rate = Basic Monthly Pay / Monthly Standard Hours (Default: 208)
- Daytime Overtime Multiplier (6:00 AM – 10:00 PM): 1.5× (Art. 68(1)(a))
- Nighttime Overtime Multiplier (10:00 PM – 6:00 AM): 1.75× (Art. 68(1)(b))
- Weekly Rest Day Multiplier: 2.0× (Art. 68(1)(c))
- Public Holiday Multiplier: 2.5× (Art. 68(1)(d))
- Maximum Overtime: 2 hrs/day, 10 hrs/week (Art. 70)
"""

from typing import Any

# ---------------------------------------------------------------------------
# Ethiopian Labour Proclamation No. 1156/2019 Constants
# ---------------------------------------------------------------------------
DEFAULT_MONTHLY_HOURS: float = 208.0    # 48 hrs/week * (52 weeks / 12 months) = 208 hrs/month (Art. 61)
STANDARD_HOURS_PER_DAY: int = 8         # Normal working hours per day (Art. 61)
STANDARD_DAYS_PER_MONTH: int = 26       # Ethiopian standard working days per month

DAYTIME_OVERTIME_MULTIPLIER: float = 1.5        # 6:00 AM – 10:00 PM (Art. 68(1)(a))
NIGHTTIME_OVERTIME_MULTIPLIER: float = 1.75     # 10:00 PM – 6:00 AM (Art. 68(1)(b))
REST_DAY_MULTIPLIER: float = 2.0                # Weekly Rest Day (Art. 68(1)(c))
PUBLIC_HOLIDAY_MULTIPLIER: float = 2.5          # Public Holiday (Art. 68(1)(d))

# Legacy alias for backward compatibility
OVERTIME_MULTIPLIER: float = DAYTIME_OVERTIME_MULTIPLIER

MAX_OVERTIME_HOURS_PER_DAY: int = 2     # Art. 70
MAX_OVERTIME_HOURS_PER_WEEK: int = 10   # Art. 70

LEGAL_REFERENCES: list[str] = [
    "Proclamation No. 1156/2019, Art. 61 — Normal working hours (8 hrs/day, 48 hrs/week, 208 hrs/month)",
    "Proclamation No. 1156/2019, Art. 68(1)(a) — Daytime overtime rate (1.5×, 6:00 AM – 10:00 PM)",
    "Proclamation No. 1156/2019, Art. 68(1)(b) — Nighttime overtime rate (1.75×, 10:00 PM – 6:00 AM)",
    "Proclamation No. 1156/2019, Art. 68(1)(c) — Weekly rest-day overtime rate (2.0×)",
    "Proclamation No. 1156/2019, Art. 68(1)(d) — Public holiday overtime rate (2.5×)",
    "Proclamation No. 1156/2019, Art. 70 — Maximum overtime limits (2 hrs/day, 10 hrs/week)",
]

DISCLAIMER: str = (
    "This is a statutory calculation based on Ethiopian Labour Proclamation No. 1156/2019. "
    "Consult a qualified labour lawyer for personalised legal advice."
)


class WageCalculator:
    """
    Computes statutory wage and overtime pay under Ethiopian Labour Proclamation No. 1156/2019.

    Response Structure Requirements:
    1. Mandatory Order: Category breakdown FIRST, final calculated results SECOND.
    2. No Assumptions: Defaults to 208 hours/month (48 hrs/week).
    3. Category Transparency: Displays formula, rate multiplier, hours worked, and subtotal (ETB).
    """

    def calculate(
        self,
        basic_monthly_pay: float | None = None,
        monthly_hours_divisor: float = DEFAULT_MONTHLY_HOURS,
        daytime_overtime_hours: float = 0.0,
        nighttime_overtime_hours: float = 0.0,
        rest_day_overtime_hours: float = 0.0,
        public_holiday_overtime_hours: float = 0.0,
        # Legacy parameter compatibility
        daily_base_salary: float | None = None,
        standard_overtime_hours: float | None = None,
        rest_day_hours: float | None = None,
    ) -> dict[str, Any]:
        """
        Compute wage and overtime pay breakdown and final total.

        Parameters
        ----------
        basic_monthly_pay:
            Basic monthly salary in Ethiopian Birr (ETB). Must be > 0.
        monthly_hours_divisor:
            Standard working hours per month divisor (default: 208).
        daytime_overtime_hours:
            Overtime hours worked between 6:00 AM and 10:00 PM (1.5×).
        nighttime_overtime_hours:
            Overtime hours worked between 10:00 PM and 6:00 AM (1.75×).
        rest_day_overtime_hours:
            Hours worked on weekly rest day (2.0×).
        public_holiday_overtime_hours:
            Hours worked on declared public holiday (2.5×).
        daily_base_salary:
            Legacy daily rate. If supplied and basic_monthly_pay is None,
            basic_monthly_pay is derived.
        standard_overtime_hours:
            Legacy alias for daytime_overtime_hours.
        rest_day_hours:
            Legacy alias for rest_day_overtime_hours.
        """
        # Resolve legacy parameters
        is_legacy_daily = False
        if basic_monthly_pay is None:
            if daily_base_salary is not None:
                if daily_base_salary <= 0:
                    raise ValueError("daily_base_salary must be greater than zero.")
                # Daily salary mapped to basic monthly pay
                basic_monthly_pay = daily_base_salary * (monthly_hours_divisor / STANDARD_HOURS_PER_DAY)
                is_legacy_daily = True
            else:
                raise ValueError("basic_monthly_pay or daily_base_salary must be provided.")

        if basic_monthly_pay <= 0:
            raise ValueError("basic_monthly_pay must be greater than zero.")
        if monthly_hours_divisor <= 0:
            raise ValueError("monthly_hours_divisor must be greater than zero.")

        # Map legacy overtime hours if provided
        if standard_overtime_hours is not None and daytime_overtime_hours == 0.0:
            daytime_overtime_hours = standard_overtime_hours
        if rest_day_hours is not None and rest_day_overtime_hours == 0.0:
            rest_day_overtime_hours = rest_day_hours

        # Validate non-negative hours
        for label, hrs in [
            ("daytime_overtime_hours", daytime_overtime_hours),
            ("nighttime_overtime_hours", nighttime_overtime_hours),
            ("rest_day_overtime_hours", rest_day_overtime_hours),
            ("public_holiday_overtime_hours", public_holiday_overtime_hours),
        ]:
            if hrs < 0:
                raise ValueError(f"{label} cannot be negative.")

        # Base Hourly Rate
        hourly_rate: float = basic_monthly_pay / monthly_hours_divisor

        # Category Subtotals
        daytime_subtotal: float = hourly_rate * DAYTIME_OVERTIME_MULTIPLIER * daytime_overtime_hours
        nighttime_subtotal: float = hourly_rate * NIGHTTIME_OVERTIME_MULTIPLIER * nighttime_overtime_hours
        rest_day_subtotal: float = hourly_rate * REST_DAY_MULTIPLIER * rest_day_overtime_hours
        public_holiday_subtotal: float = hourly_rate * PUBLIC_HOLIDAY_MULTIPLIER * public_holiday_overtime_hours

        total_overtime_pay: float = (
            daytime_subtotal
            + nighttime_subtotal
            + rest_day_subtotal
            + public_holiday_subtotal
        )

        base_pay_for_total = daily_base_salary if is_legacy_daily and daily_base_salary is not None else basic_monthly_pay
        gross_earnings: float = base_pay_for_total + total_overtime_pay

        # Format calculation formulas transparently per output template
        rate_formula = f"{basic_monthly_pay:.2f} ETB ÷ {monthly_hours_divisor:.2f} hrs = {hourly_rate:.2f} ETB/hr"
        daytime_formula = f"{daytime_overtime_hours:.2f} hrs × {hourly_rate:.2f} ETB × {DAYTIME_OVERTIME_MULTIPLIER} = {daytime_subtotal:.2f} ETB"
        nighttime_formula = f"{nighttime_overtime_hours:.2f} hrs × {hourly_rate:.2f} ETB × {NIGHTTIME_OVERTIME_MULTIPLIER} = {nighttime_subtotal:.2f} ETB"
        rest_day_formula = f"{rest_day_overtime_hours:.2f} hrs × {hourly_rate:.2f} ETB × {REST_DAY_MULTIPLIER} = {rest_day_subtotal:.2f} ETB"
        holiday_formula = f"{public_holiday_overtime_hours:.2f} hrs × {hourly_rate:.2f} ETB × {PUBLIC_HOLIDAY_MULTIPLIER} = {public_holiday_subtotal:.2f} ETB"

        formatted_breakdown = (
            "#### 1. Calculation Breakdown by Category\n\n"
            f"* Base Hourly Rate:\n  {rate_formula}\n\n"
            f"* Daytime Overtime ({DAYTIME_OVERTIME_MULTIPLIER}×):\n  {daytime_formula}\n\n"
            f"* Nighttime Overtime ({NIGHTTIME_OVERTIME_MULTIPLIER}×):\n  {nighttime_formula}\n\n"
            f"* Weekly Rest Day Overtime ({REST_DAY_MULTIPLIER}×):\n  {rest_day_formula}\n\n"
            f"* Public Holiday Overtime ({PUBLIC_HOLIDAY_MULTIPLIER}×):\n  {holiday_formula}\n\n"
            "---\n\n"
            "#### 2. Final Calculated Results\n\n"
            f"* Total Overtime Pay: {total_overtime_pay:.2f} ETB\n"
            f"* Gross Earnings (Basic + Overtime): {gross_earnings:.2f} ETB"
        )

        # Warnings for Art. 70 daily overtime limit (max 2 hrs/day)
        warnings: list[str] = []
        total_daily_ot = daytime_overtime_hours + nighttime_overtime_hours
        if total_daily_ot > MAX_OVERTIME_HOURS_PER_DAY:
            warnings.append(
                f"Daily overtime ({total_daily_ot:.1f} hrs) exceeds statutory maximum of "
                f"{MAX_OVERTIME_HOURS_PER_DAY} hours/day (Art. 70). "
                "Written employee consent and Labour Inspection approval are required."
            )
        if rest_day_overtime_hours > MAX_OVERTIME_HOURS_PER_DAY:
            warnings.append(
                f"Rest-day hours ({rest_day_overtime_hours:.1f} hrs) exceed standard maximum of "
                f"{MAX_OVERTIME_HOURS_PER_DAY} hours/day (Art. 70)."
            )

        return {
            # 1. Calculation Breakdown by Category (MANDATORY FIRST)
            "breakdown": {
                "base_hourly_rate": {
                    "basic_monthly_pay": round(basic_monthly_pay, 2),
                    "monthly_hours": round(monthly_hours_divisor, 2),
                    "hourly_rate": round(hourly_rate, 2),
                    "formula": rate_formula,
                },
                "daytime_overtime": {
                    "multiplier": DAYTIME_OVERTIME_MULTIPLIER,
                    "hours": round(daytime_overtime_hours, 2),
                    "hourly_rate": round(hourly_rate, 2),
                    "subtotal": round(daytime_subtotal, 2),
                    "formula": daytime_formula,
                },
                "nighttime_overtime": {
                    "multiplier": NIGHTTIME_OVERTIME_MULTIPLIER,
                    "hours": round(nighttime_overtime_hours, 2),
                    "hourly_rate": round(hourly_rate, 2),
                    "subtotal": round(nighttime_subtotal, 2),
                    "formula": nighttime_formula,
                },
                "weekly_rest_day_overtime": {
                    "multiplier": REST_DAY_MULTIPLIER,
                    "hours": round(rest_day_overtime_hours, 2),
                    "hourly_rate": round(hourly_rate, 2),
                    "subtotal": round(rest_day_subtotal, 2),
                    "formula": rest_day_formula,
                },
                "public_holiday_overtime": {
                    "multiplier": PUBLIC_HOLIDAY_MULTIPLIER,
                    "hours": round(public_holiday_overtime_hours, 2),
                    "hourly_rate": round(hourly_rate, 2),
                    "subtotal": round(public_holiday_subtotal, 2),
                    "formula": holiday_formula,
                },
                "formatted_breakdown": formatted_breakdown,
                # Legacy compatibility fields
                "standard_hours": STANDARD_HOURS_PER_DAY,
                "standard_overtime_hours": daytime_overtime_hours,
                "rest_day_hours": rest_day_overtime_hours,
                "overtime_multiplier": DAYTIME_OVERTIME_MULTIPLIER,
                "rest_day_multiplier": REST_DAY_MULTIPLIER,
            },
            # 2. Final Calculated Results (MANDATORY SECOND)
            "final_results": {
                "total_overtime_pay": round(total_overtime_pay, 2),
                "gross_earnings": round(gross_earnings, 2),
            },
            # Top-level direct access & legacy compatibility
            "hourly_rate": round(hourly_rate, 2),
            "base_pay": round(base_pay_for_total, 2),
            "standard_overtime_pay": round(daytime_subtotal, 2),
            "nighttime_overtime_pay": round(nighttime_subtotal, 2),
            "rest_day_pay": round(rest_day_subtotal, 2),
            "public_holiday_pay": round(public_holiday_subtotal, 2),
            "total_overtime_pay": round(total_overtime_pay, 2),
            "total_pay": round(gross_earnings, 2),
            "gross_earnings": round(gross_earnings, 2),
            "formatted_text": formatted_breakdown,
            "legal_references": LEGAL_REFERENCES,
            "warnings": warnings,
            "disclaimer": DISCLAIMER,
            "currency": "ETB",
        }
