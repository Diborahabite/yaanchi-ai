"""
app/services/vector_store.py
Lightweight keyword / TF-IDF-inspired vector store with no external dependencies.
Used as the primary retrieval layer for the RAG engine.
"""

import math
import re
from collections import Counter
from typing import Any


def _tokenise(text: str) -> list[str]:
    """Lowercase, strip punctuation, split into word tokens."""
    return re.findall(r"[a-z0-9]+", text.lower())


def _tf(tokens: list[str]) -> dict[str, float]:
    """Term-frequency map (raw count / total tokens)."""
    total = len(tokens) or 1
    counts = Counter(tokens)
    return {term: count / total for term, count in counts.items()}


class SimpleVectorStore:
    """
    In-memory TF-IDF-based document store.

    Documents are dicts with at minimum:
        ``id``      — unique identifier
        ``text``    — full text to index
        ``article`` — human-readable article label
    Any additional keys are preserved and returned in search results.
    """

    def __init__(self) -> None:
        self._docs: list[dict[str, Any]] = []
        # Inverted index: term → {doc_index → tf}
        self._tf_index: dict[str, dict[int, float]] = {}
        # IDF: term → idf value
        self._idf: dict[str, float] = {}

    # ------------------------------------------------------------------
    # Indexing
    # ------------------------------------------------------------------

    def add_documents(self, docs: list[dict[str, Any]]) -> None:
        """
        Add *docs* to the store and rebuild the TF-IDF index.

        Each document **must** contain ``id``, ``text``, and ``article`` keys.
        """
        start_idx = len(self._docs)
        self._docs.extend(docs)
        self._rebuild_index(start_idx)

    def _rebuild_index(self, from_idx: int = 0) -> None:
        """(Re)build TF and IDF structures for documents from *from_idx* onwards."""
        n_total = len(self._docs)

        for idx in range(from_idx, n_total):
            tokens = _tokenise(self._docs[idx].get("text", ""))
            tf_map = _tf(tokens)
            for term, tf_val in tf_map.items():
                if term not in self._tf_index:
                    self._tf_index[term] = {}
                self._tf_index[term][idx] = tf_val

        # Recompute IDF for every known term
        for term, postings in self._tf_index.items():
            df = len(postings)
            self._idf[term] = math.log((n_total + 1) / (df + 1)) + 1.0

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------

    def search(self, query: str, top_k: int = 3) -> list[dict[str, Any]]:
        """
        Return the *top_k* most relevant documents for *query*.

        Each result dict contains all original document fields plus a
        ``relevance_score`` (float in [0, 1]) rounded to 4 decimal places.
        """
        if not self._docs:
            return []

        query_tokens = _tokenise(query)
        if not query_tokens:
            return []

        scores: dict[int, float] = {}
        for term in query_tokens:
            if term not in self._tf_index:
                continue
            idf = self._idf.get(term, 1.0)
            for doc_idx, tf_val in self._tf_index[term].items():
                scores[doc_idx] = scores.get(doc_idx, 0.0) + tf_val * idf

        if not scores:
            return []

        # Normalise scores to [0, 1]
        max_score = max(scores.values())
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

        results: list[dict[str, Any]] = []
        for doc_idx, raw_score in ranked:
            doc = dict(self._docs[doc_idx])
            doc["relevance_score"] = round(raw_score / max_score, 4)
            results.append(doc)
        return results

    # ------------------------------------------------------------------
    # Inspection helpers
    # ------------------------------------------------------------------

    @property
    def document_count(self) -> int:
        return len(self._docs)

    def clear(self) -> None:
        """Remove all documents and reset the index."""
        self._docs.clear()
        self._tf_index.clear()
        self._idf.clear()
