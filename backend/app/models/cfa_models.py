"""
app/models/cfa_models.py
Pydantic schemas for the CFA AI Sandbox API integration.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class CFAChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Prompt to send to CFA AI Sandbox")
    system_prompt: Optional[str] = Field(
        None,
        description="Optional system instruction for the model"
    )
    model: str = Field(
        "default",
        description="Target model identifier in the CFA Sandbox"
    )


class CFAChatResponse(BaseModel):
    success: bool
    data: Optional[dict[str, Any]] = None
    content: Optional[str] = None
    error: Optional[str] = None
