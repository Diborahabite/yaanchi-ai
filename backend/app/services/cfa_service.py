"""
app/services/cfa_service.py
CFA AI Sandbox Integration Service for Yanchi AI.
Handles communication with the CFA AI Sandbox API endpoints.
"""

import os
from typing import Any
import httpx
from dotenv import load_dotenv

from app.config import get_settings

load_dotenv()


def get_cfa_credentials() -> tuple[str, str]:
    """Retrieve CFA credentials from environment or application settings."""
    settings = get_settings()
    base_url = os.getenv("CFA_API_BASE_URL") or settings.CFA_API_BASE_URL
    api_key = os.getenv("CFA_TEAM_API_KEY") or settings.CFA_TEAM_API_KEY
    return base_url.rstrip("/"), api_key


async def query_sandbox_ai(
    prompt: str,
    system_prompt: str | None = None,
    model: str = "default",
    timeout: float = 60.0,
) -> dict[str, Any]:
    """
    Query the CFA AI Sandbox API with a user prompt.

    Parameters
    ----------
    prompt:
        The user query or prompt.
    system_prompt:
        Optional system instruction to guide model behaviour.
    model:
        Model identifier (defaults to "default").
    timeout:
        Request timeout in seconds (default: 60.0s).

    Returns
    -------
    dict
        Parsed JSON response from the sandbox /chat/completions endpoint.
    """
    base_url, api_key = get_cfa_credentials()

    if not api_key or api_key == "your_actual_team_api_key_here":
        raise ValueError(
            "CFA_TEAM_API_KEY is not configured. Please set CFA_TEAM_API_KEY in your .env file."
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/chat/completions",
            json=payload,
            headers=headers,
            timeout=timeout,
        )
        response.raise_for_status()
        return response.json()
