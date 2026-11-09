"""
tests/test_api.py
Integration tests for the FastAPI endpoints including statutory wage calculations.
Run with: pytest tests/test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="module")
def client() -> TestClient:
    """Create a TestClient with the app lifespan (RAG engine initialised)."""
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------------------------
# Health endpoints
# ---------------------------------------------------------------------------

def test_root_health(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app" in data


def test_api_health(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


# ---------------------------------------------------------------------------
# Statutory Wage Calculator Endpoint (New Model)
# ---------------------------------------------------------------------------

def test_calculate_wage_monthly_basic_pay(client: TestClient) -> None:
    payload = {
        "basic_monthly_pay": 10400.0,
        "monthly_hours_divisor": 208.0,
        "daytime_overtime_hours": 2.0,
        "nighttime_overtime_hours": 2.0,
        "rest_day_overtime_hours": 1.0,
        "public_holiday_overtime_hours": 1.0,
    }
    response = client.post("/api/v1/calculate-wage", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify Response Structure: breakdown FIRST, final_results SECOND
    keys = list(data.keys())
    assert keys[0] == "breakdown"
    assert keys[1] == "final_results"

    # Rate: 10400 / 208 = 50.00
    # Daytime (1.5x) * 2 = 150
    # Nighttime (1.75x) * 2 = 175
    # Rest Day (2.0x) * 1 = 100
    # Holiday (2.5x) * 1 = 125
    # Total OT = 550
    assert data["hourly_rate"] == 50.0
    assert data["breakdown"]["base_hourly_rate"]["hourly_rate"] == 50.0
    assert data["breakdown"]["daytime_overtime"]["subtotal"] == 150.0
    assert data["breakdown"]["nighttime_overtime"]["subtotal"] == 175.0
    assert data["breakdown"]["weekly_rest_day_overtime"]["subtotal"] == 100.0
    assert data["breakdown"]["public_holiday_overtime"]["subtotal"] == 125.0

    assert data["final_results"]["total_overtime_pay"] == 550.0
    assert data["final_results"]["gross_earnings"] == 10950.0

    # Formatted template text check
    assert "#### 1. Calculation Breakdown by Category" in data["formatted_text"]
    assert "#### 2. Final Calculated Results" in data["formatted_text"]


def test_calculate_wage_legacy_daily_payload(client: TestClient) -> None:
    """Legacy daily payload works transparently."""
    payload = {
        "daily_base_salary": 480.0,
        "standard_overtime_hours": 2.0,
        "rest_day_hours": 1.0,
    }
    response = client.post("/api/v1/calculate-wage", json=payload)
    assert response.status_code == 200
    data = response.json()
    # hourly = 480 / 8 = 60; daytime = 60 * 1.5 * 2 = 180; rest_day = 60 * 2 * 1 = 120
    assert data["hourly_rate"] == 60.0
    assert data["standard_overtime_pay"] == 180.0
    assert data["rest_day_pay"] == 120.0
    assert data["total_overtime_pay"] == 300.0
    assert data["total_pay"] == 780.0


def test_calculate_wage_invalid_input(client: TestClient) -> None:
    response = client.post("/api/v1/calculate-wage", json={"basic_monthly_pay": -100.0})
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Legal Q&A endpoint
# ---------------------------------------------------------------------------

def test_legal_qa_basic(client: TestClient) -> None:
    payload = {"question": "What are my overtime rights?", "language": "en", "ghost_mode": False}
    response = client.post("/api/v1/legal-qa", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert isinstance(data["sources"], list)
    assert "disclaimer" in data


def test_legal_qa_ghost_mode(client: TestClient) -> None:
    payload = {"question": "What is the maximum overtime per day?", "ghost_mode": True}
    response = client.post("/api/v1/legal-qa", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_purged"] is True
