"""
app/models/legal_models.py
Pydantic v2 request/response models for the legal Q&A endpoint.
"""

from pydantic import BaseModel, Field


class LegalQARequest(BaseModel):
    """Input payload for POST /api/v1/legal-qa."""

    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="The question to answer using the labour-law knowledge base.",
        examples=["What are my rights regarding overtime pay?"],
    )
    language: str = Field(
        "en",
        pattern="^(en|am)$",
        description="Response language: 'en' (English) or 'am' (Amharic).",
    )
    ghost_mode: bool = Field(
        False,
        description="When True, any session data is purged immediately after the response.",
    )


class LegalSource(BaseModel):
    """A single retrieved article from the knowledge base."""

    article: str = Field(..., description="Article identifier (e.g. 'Article 68').")
    text: str = Field(..., description="Verbatim article text.")
    relevance_score: float = Field(
        ..., ge=0.0, le=1.0, description="Retrieval relevance score (0–1)."
    )


class LegalQAResponse(BaseModel):
    """Full legal Q&A result returned by the API."""

    answer: str = Field(..., description="Synthesised answer drawn from retrieved articles.")
    sources: list[LegalSource] = Field(..., description="Supporting articles retrieved.")
    legal_references: list[str] = Field(..., description="Formal proclamation citations.")
    disclaimer: str = Field(..., description="Legal disclaimer.")
    session_purged: bool = Field(
        ..., description="True if ghost-mode data was purged after this response."
    )

