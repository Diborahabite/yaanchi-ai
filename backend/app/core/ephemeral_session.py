"""
app/core/ephemeral_session.py
Thread-safe in-memory ephemeral session store with configurable TTL.

Ghost mode: a session created with ttl_override=0 is purged immediately
after the first read, leaving no persistent trace.
"""

import threading
import time
from typing import Any

from app.config import get_settings


class EphemeralSessionStore:
    """
    Thread-safe in-memory store for short-lived session data.

    Each session entry contains the payload plus an expiry timestamp.
    Ghost-mode sessions (TTL = 0) are deleted on the first read.
    """

    def __init__(self, default_ttl_seconds: int | None = None) -> None:
        settings = get_settings()
        self._ttl: int = (
            default_ttl_seconds
            if default_ttl_seconds is not None
            else settings.EPHEMERAL_SESSION_TTL_SECONDS
        )
        self._store: dict[str, dict] = {}
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def create_session(
        self,
        session_id: str,
        data: Any,
        *,
        ttl_override: int | None = None,
        ghost_mode: bool = False,
    ) -> str:
        """
        Store *data* under *session_id*.

        Parameters
        ----------
        session_id:
            Unique identifier for this session.
        data:
            Arbitrary payload to store.
        ttl_override:
            Optional TTL (seconds). Overrides the store-wide default.
        ghost_mode:
            When True the session TTL is set to 0 and the entry is
            purged immediately after the first :meth:`get_session` call.

        Returns
        -------
        str
            The *session_id* that was stored.
        """
        ttl = 0 if ghost_mode else (ttl_override if ttl_override is not None else self._ttl)
        expires_at = time.time() + ttl if ttl > 0 else 0  # 0 = ghost (delete on read)

        with self._lock:
            self._store[session_id] = {
                "data": data,
                "expires_at": expires_at,
                "ghost": ghost_mode or ttl == 0,
            }
        return session_id

    def get_session(self, session_id: str) -> Any | None:
        """
        Retrieve session data.

        Returns *None* if the session does not exist or has expired.
        Ghost-mode sessions are purged immediately after this read.
        """
        with self._lock:
            entry = self._store.get(session_id)
            if entry is None:
                return None

            # Expired (non-ghost entries only)
            if not entry["ghost"] and time.time() > entry["expires_at"]:
                del self._store[session_id]
                return None

            data = entry["data"]

            # Ghost: delete on first read
            if entry["ghost"]:
                del self._store[session_id]

            return data

    def purge_session(self, session_id: str) -> bool:
        """
        Immediately delete a session regardless of TTL.

        Returns True if the session existed and was deleted, False otherwise.
        """
        with self._lock:
            existed = session_id in self._store
            self._store.pop(session_id, None)
        return existed

    def cleanup_expired(self) -> int:
        """
        Purge all expired non-ghost sessions.

        Returns the number of sessions removed.
        """
        now = time.time()
        removed = 0
        with self._lock:
            expired_ids = [
                sid
                for sid, entry in self._store.items()
                if not entry["ghost"] and now > entry["expires_at"]
            ]
            for sid in expired_ids:
                del self._store[sid]
                removed += 1
        return removed

    @property
    def session_count(self) -> int:
        """Return the current number of stored sessions (thread-safe)."""
        with self._lock:
            return len(self._store)


# ---------------------------------------------------------------------------
# Module-level singleton (optional convenience)
# ---------------------------------------------------------------------------
_store_instance: EphemeralSessionStore | None = None
_store_lock = threading.Lock()


def get_session_store() -> EphemeralSessionStore:
    """Return the application-wide EphemeralSessionStore singleton."""
    global _store_instance
    if _store_instance is None:
        with _store_lock:
            if _store_instance is None:
                _store_instance = EphemeralSessionStore()
    return _store_instance
