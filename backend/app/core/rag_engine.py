"""
app/core/rag_engine.py
Retrieval-Augmented Generation engine for Ethiopian Labour Law Q&A.
Uses the SimpleVectorStore for retrieval and builds structured answers
from the proclamation_1156_2019.json knowledge base.
"""

import json
import os
from pathlib import Path

from app.services.vector_store import SimpleVectorStore

# Path to the legal knowledge base (relative to project root)
DATA_FILE = Path(__file__).parent.parent / "data" / "proclamation_1156_2019.json"

DISCLAIMER = (
    "This information is provided for educational purposes only and is based on "
    "Ethiopian Labour Proclamation No. 1156/2019. It does not constitute legal advice. "
    "For specific legal matters, please consult a qualified labour lawyer."
)


class RAGEngine:
    """
    Retrieval-Augmented Generation engine for labour-law Q&A.

    On startup:
    1. Loads article documents from the JSON knowledge base.
    2. Indexes them in SimpleVectorStore using TF-IDF.

    On query:
    1. Retrieves the top-k most relevant articles.
    2. Synthesises a structured answer with citations.
    """

    def __init__(self, vector_db_path: str = "./chroma_db") -> None:
        # vector_db_path kept for interface compatibility; not used by SimpleVectorStore
        self._vector_db_path = vector_db_path
        self._store = SimpleVectorStore()
        self._loaded = False

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------

    def load(self) -> None:
        """Load documents and build the search index."""
        if self._loaded:
            return

        articles = self._read_articles()
        docs = [
            {
                "id": art["id"],
                "article": art["article"],
                "title": art.get("title", ""),
                "text": f"{art['article']}: {art.get('title', '')}. {art['text']}",
                "raw_text": art["text"],
            }
            for art in articles
        ]
        self._store.add_documents(docs)
        self._loaded = True

    def _read_articles(self) -> list[dict]:
        """Read articles from the JSON knowledge base, with a hard-coded fallback."""
        try:
            with open(DATA_FILE, encoding="utf-8") as fh:
                data = json.load(fh)
            return data.get("articles", [])
        except (FileNotFoundError, json.JSONDecodeError):
            # Minimal fallback so the engine still works without the data file
            return [
                {
                    "id": "art_61",
                    "article": "Article 61",
                    "title": "Normal Working Hours",
                    "text": "The normal working hours shall not exceed 8 hours per day or 48 hours per week.",
                },
                {
                    "id": "art_68",
                    "article": "Article 68",
                    "title": "Overtime Pay Rate",
                    "text": "An employee who works overtime on a normal working day is entitled to 1.5x the normal hourly rate.",
                },
                {
                    "id": "art_69",
                    "article": "Article 69",
                    "title": "Rest Day and Holiday Overtime",
                    "text": "An employee required to work on a rest day or public holiday is entitled to 2.0x the normal hourly rate.",
                },
                {
                    "id": "art_70",
                    "article": "Article 70",
                    "title": "Maximum Overtime Hours",
                    "text": "Overtime shall not exceed 2 hours per day and 10 hours per week.",
                },
            ]

    # ------------------------------------------------------------------
    # Query
    # ------------------------------------------------------------------

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        """
        Retrieve the top-k most relevant articles for *query*.

        Returns a list of dicts with keys:
            article, text (raw), relevance_score
        """
        if not self._loaded:
            self.load()

        raw_results = self._store.search(query, top_k=top_k)
        return [
            {
                "article": r["article"],
                "text": r["raw_text"],
                "relevance_score": r["relevance_score"],
            }
            for r in raw_results
        ]

    def answer(self, question: str, top_k: int = 3) -> dict:
        """
        Generate a structured answer for *question*.

        Returns
        -------
        dict with keys:
            answer, sources, legal_references, disclaimer, session_purged
        """
        sources = self.search(question, top_k=top_k)

        if not sources:
            return {
                "answer": (
                    "I could not find a specific article directly addressing your question. "
                    "Please consult the full text of Ethiopian Labour Proclamation No. 1156/2019 "
                    "or seek advice from a qualified labour lawyer."
                ),
                "sources": [],
                "legal_references": ["Ethiopian Labour Proclamation No. 1156/2019"],
                "disclaimer": DISCLAIMER,
                "session_purged": False,
            }

        # Build a plain-text answer from the top source
        top = sources[0]
        answer_text = (
            f"Based on {top['article']} of Ethiopian Labour Proclamation No. 1156/2019: "
            f"{top['text']}"
        )
        if len(sources) > 1:
            answer_text += (
                f" Additionally, {sources[1]['article']} states: {sources[1]['text']}"
            )

        legal_references = [
            f"Proclamation No. 1156/2019, {src['article']}" for src in sources
        ]

        return {
            "answer": answer_text,
            "sources": sources,
            "legal_references": legal_references,
            "disclaimer": DISCLAIMER,
            "session_purged": False,
        }

    @property
    def document_count(self) -> int:
        return self._store.document_count

