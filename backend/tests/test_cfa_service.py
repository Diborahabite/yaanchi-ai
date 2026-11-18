"""
tests/test_cfa_service.py
Unit and endpoint tests for CFA AI Sandbox API integration.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from main import app
from app.services.cfa_service import query_sandbox_ai


client = TestClient(app)


@pytest.mark.asyncio
async def test_cfa_service_missing_key_raises_value_error():
    """Ensure an unconfigured or default API key raises ValueError with clear message."""
    with patch("app.services.cfa_service.get_cfa_credentials", return_value=("https://test-sandbox.com", "")):
        with pytest.raises(ValueError, match="CFA_TEAM_API_KEY is not configured"):
            await query_sandbox_ai(prompt="Hello CFA Sandbox")


@pytest.mark.asyncio
async def test_cfa_service_mocked_success():
    """Ensure query_sandbox_ai sends proper payload and returns response."""
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "id": "chatcmpl-test",
        "object": "chat.completion",
        "choices": [
            {
                "message": {"role": "assistant", "content": "Welcome to CFA Sandbox Response!"}
            }
        ],
    }
    mock_response.raise_for_status = MagicMock()

    with patch("app.services.cfa_service.get_cfa_credentials", return_value=("https://test-sandbox.com", "valid_team_key")):
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_response

            result = await query_sandbox_ai(
                prompt="What are my rights?",
                system_prompt="You are an Ethiopian labour lawyer.",
                model="default"
            )

            assert result["id"] == "chatcmpl-test"
            assert result["choices"][0]["message"]["content"] == "Welcome to CFA Sandbox Response!"
            mock_post.assert_called_once()
            call_kwargs = mock_post.call_args.kwargs
            assert call_kwargs["json"]["model"] == "default"
            assert len(call_kwargs["json"]["messages"]) == 2
            assert call_kwargs["json"]["messages"][0]["role"] == "system"
            assert call_kwargs["json"]["messages"][1]["role"] == "user"


def test_api_cfa_chat_endpoint_mocked():
    """Test POST /api/v1/cfa-chat endpoint."""
    mock_cfa_data = {
        "id": "chatcmpl-123",
        "choices": [
            {
                "message": {"role": "assistant", "content": "CFA response through FastAPI endpoint."}
            }
        ]
    }

    with patch("app.api.routes.cfa.query_sandbox_ai", new_callable=AsyncMock) as mock_query:
        mock_query.return_value = mock_cfa_data

        response = client.post(
            "/api/v1/cfa-chat",
            json={
                "prompt": "Explain overtime calculation under proclamation 1156/2019",
                "system_prompt": "Helpful Ethiopian labor legal assistant."
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["content"] == "CFA response through FastAPI endpoint."
        assert data["data"]["id"] == "chatcmpl-123"
