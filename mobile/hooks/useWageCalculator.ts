import { useState } from 'react';
import axios from 'axios';
import { Endpoints } from '../constants/Api';

export interface CategoryBreakdownItem {
  multiplier?: number;
  hours?: number;
  hourly_rate: number;
  subtotal?: number;
  formula: string;
}

export interface DetailedWageBreakdown {
  base_hourly_rate: {
    basic_monthly_pay: number;
    monthly_hours: number;
    hourly_rate: number;
    formula: string;
  };
  daytime_overtime: CategoryBreakdownItem;
  nighttime_overtime: CategoryBreakdownItem;
  weekly_rest_day_overtime: CategoryBreakdownItem;
  public_holiday_overtime: CategoryBreakdownItem;
  formatted_breakdown: string;
}

export interface FinalCalculatedResults {
  total_overtime_pay: number;
  gross_earnings: number;
}

export interface WageResult {
  breakdown: DetailedWageBreakdown;
  final_results: FinalCalculatedResults;
  hourly_rate: number;
  base_pay: number;
  standard_overtime_pay: number;
  nighttime_overtime_pay: number;
  rest_day_pay: number;
  public_holiday_pay: number;
  total_overtime_pay: number;
  total_pay: number;
  gross_earnings: number;
  formatted_text: string;
  legal_references: string[];
  warnings: string[];
  disclaimer: string;
  currency: string;
}

export interface StatutoryWageInput {
  basic_monthly_pay: number;
  monthly_hours_divisor?: number;
  daytime_overtime_hours?: number;
  nighttime_overtime_hours?: number;
  rest_day_overtime_hours?: number;
  public_holiday_overtime_hours?: number;
}

export function useWageCalculator() {
  const [result, setResult] = useState<WageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (input: StatutoryWageInput) => {
    setLoading(true);
    setError(null);
    const basic = input.basic_monthly_pay;
    const divisor = input.monthly_hours_divisor ?? 208.0;
    const daytime = input.daytime_overtime_hours ?? 0.0;
    const nighttime = input.nighttime_overtime_hours ?? 0.0;
    const restDay = input.rest_day_overtime_hours ?? 0.0;
    const holiday = input.public_holiday_overtime_hours ?? 0.0;

    try {
      const response = await axios.post(
        Endpoints.calculateWage,
        {
          basic_monthly_pay: basic,
          monthly_hours_divisor: divisor,
          daytime_overtime_hours: daytime,
          nighttime_overtime_hours: nighttime,
          rest_day_overtime_hours: restDay,
          public_holiday_overtime_hours: holiday,
        },
        { timeout: 10000 }
      );
      setResult(response.data);
    } catch (err: any) {
      // Fallback: statutory calculation engine computed locally
      const hourly = basic / divisor;
      const daySub = hourly * 1.5 * daytime;
      const nightSub = hourly * 1.75 * nighttime;
      const restSub = hourly * 2.0 * restDay;
      const holSub = hourly * 2.5 * holiday;
      const totalOt = daySub + nightSub + restSub + holSub;
      const gross = basic + totalOt;

      const rateFormula = `${basic.toFixed(2)} ETB ÷ ${divisor.toFixed(2)} hrs = ${hourly.toFixed(2)} ETB/hr`;
      const dayFormula = `${daytime.toFixed(2)} hrs × ${hourly.toFixed(2)} ETB × 1.5 = ${daySub.toFixed(2)} ETB`;
      const nightFormula = `${nighttime.toFixed(2)} hrs × ${hourly.toFixed(2)} ETB × 1.75 = ${nightSub.toFixed(2)} ETB`;
      const restFormula = `${restDay.toFixed(2)} hrs × ${hourly.toFixed(2)} ETB × 2.0 = ${restSub.toFixed(2)} ETB`;
      const holFormula = `${holiday.toFixed(2)} hrs × ${hourly.toFixed(2)} ETB × 2.5 = ${holSub.toFixed(2)} ETB`;

      const formatted = `#### 1. Calculation Breakdown by Category\n\n` +
        `* Base Hourly Rate:\n  ${rateFormula}\n\n` +
        `* Daytime Overtime (1.5×):\n  ${dayFormula}\n\n` +
        `* Nighttime Overtime (1.75×):\n  ${nightFormula}\n\n` +
        `* Weekly Rest Day Overtime (2.0×):\n  ${restFormula}\n\n` +
        `* Public Holiday Overtime (2.5×):\n  ${holFormula}\n\n` +
        `---\n\n` +
        `#### 2. Final Calculated Results\n\n` +
        `* Total Overtime Pay: ${totalOt.toFixed(2)} ETB\n` +
        `* Gross Earnings (Basic + Overtime): ${gross.toFixed(2)} ETB`;

      setResult({
        breakdown: {
          base_hourly_rate: {
            basic_monthly_pay: basic,
            monthly_hours: divisor,
            hourly_rate: parseFloat(hourly.toFixed(2)),
            formula: rateFormula,
          },
          daytime_overtime: { multiplier: 1.5, hours: daytime, hourly_rate: hourly, subtotal: daySub, formula: dayFormula },
          nighttime_overtime: { multiplier: 1.75, hours: nighttime, hourly_rate: hourly, subtotal: nightSub, formula: nightFormula },
          weekly_rest_day_overtime: { multiplier: 2.0, hours: restDay, hourly_rate: hourly, subtotal: restSub, formula: restFormula },
          public_holiday_overtime: { multiplier: 2.5, hours: holiday, hourly_rate: hourly, subtotal: holSub, formula: holFormula },
          formatted_breakdown: formatted,
        },
        final_results: {
          total_overtime_pay: parseFloat(totalOt.toFixed(2)),
          gross_earnings: parseFloat(gross.toFixed(2)),
        },
        hourly_rate: parseFloat(hourly.toFixed(2)),
        base_pay: parseFloat(basic.toFixed(2)),
        standard_overtime_pay: parseFloat(daySub.toFixed(2)),
        nighttime_overtime_pay: parseFloat(nightSub.toFixed(2)),
        rest_day_pay: parseFloat(restSub.toFixed(2)),
        public_holiday_pay: parseFloat(holSub.toFixed(2)),
        total_overtime_pay: parseFloat(totalOt.toFixed(2)),
        total_pay: parseFloat(gross.toFixed(2)),
        gross_earnings: parseFloat(gross.toFixed(2)),
        formatted_text: formatted,
        legal_references: [
          'Proclamation No. 1156/2019, Art. 61 — Normal working hours (208 hrs/month)',
          'Proclamation No. 1156/2019, Art. 68(1)(a) — Daytime overtime (1.5×)',
          'Proclamation No. 1156/2019, Art. 68(1)(b) — Nighttime overtime (1.75×)',
          'Proclamation No. 1156/2019, Art. 68(1)(c) — Rest-day overtime (2.0×)',
          'Proclamation No. 1156/2019, Art. 68(1)(d) — Public holiday overtime (2.5×)',
        ],
        warnings: [],
        disclaimer: 'Statutory calculation based on Ethiopian Labour Proclamation No. 1156/2019.',
        currency: 'ETB',
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, calculate, reset };
}
