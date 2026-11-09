"""
app/api/routes/legal_qa.py
REST endpoint for RAG-powered Ethiopian labour-law Q&A.
"""

from fastapi import APIRouter, BackgroundTasks, Request, status

from app.core.ephemeral_session import get_session_store
from app.models.legal_models import LegalQARequest, LegalQAResponse, LegalSource

router = APIRouter()


def _purge_ghost_session(session_id: str) -> None:
    """Background task: immediately purge a ghost-mode session."""
    store = get_session_store()
    store.purge_session(session_id)


@router.post(
    "/legal-qa",
    response_model=LegalQAResponse,
    summary="Legal Question & Answer (RAG)",
    description=(
        "Submit a question about Ethiopian labour law. "
        "The engine retrieves the most relevant articles from "
        "Proclamation No. 1156/2019 and synthesises a cited answer. "
        "Enable ghost_mode to ensure no session data is retained."
    ),
    status_code=status.HTTP_200_OK,
)
async def legal_qa(
    request_body: LegalQARequest,
    background_tasks: BackgroundTasks,
    request: Request,
) -> LegalQAResponse:
    """
    Answer labour-law questions with citations from Proclamation No. 1156/2019.

    - **question**: Your question (3–1000 characters)
    - **language**: 'en' (English) or 'am' (Amharic)
    - **ghost_mode**: Set True to purge all session data immediately
    """
    rag_engine = request.app.state.rag_engine

    raw = rag_engine.answer(request_body.question)

    # Build typed sources
    sources = [
        LegalSource(
            article=src["article"],
            text=src["text"],
            relevance_score=src["relevance_score"],
        )
        for src in raw.get("sources", [])
    ]

    session_purged = request_body.ghost_mode
    if request_body.ghost_mode:
        # Store momentarily then schedule immediate background purge
        import uuid
        session_id = str(uuid.uuid4())
        store = get_session_store()
        store.create_session(session_id, {"q": request_body.question}, ghost_mode=True)
        background_tasks.add_task(_purge_ghost_session, session_id)

    return LegalQAResponse(
        answer=raw["answer"],
        sources=sources,
        legal_references=raw["legal_references"],
        disclaimer=raw["disclaimer"],
        session_purged=session_purged,
    )

