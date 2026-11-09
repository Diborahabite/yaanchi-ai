"""
app/api/routes/audio.py
Endpoints for Amharic speech transcription and text-to-speech synthesis.
All audio processing is ephemeral — no audio data is ever persisted.
"""

from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile, status

from app.services.audio_service import AudioService

router = APIRouter()
_audio_service = AudioService()

# Maximum upload size: 10 MB
MAX_AUDIO_BYTES = 10 * 1024 * 1024


@router.post(
    "/transcribe",
    summary="Transcribe Amharic Audio",
    description=(
        "Upload an audio file containing spoken Amharic (or English). "
        "The audio is processed ephemerally and never stored. "
        "ghost_mode=true (default) ensures zero session retention."
    ),
    status_code=status.HTTP_200_OK,
)
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file (WAV, MP3, OGG)."),
    ghost_mode: bool = Form(True, description="Purge session data immediately after transcription."),
    language: str = Form("am", description="BCP-47 language tag: 'am' or 'en'."),
) -> dict:
    """
    Transcribe uploaded audio to text.

    Returns the transcript, language, confidence score, and a flag
    confirming whether the session was purged (ghost_mode).
    """
    if language not in ("am", "en"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="language must be 'am' (Amharic) or 'en' (English).",
        )

    audio_bytes = await audio.read()

    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file exceeds the maximum allowed size of {MAX_AUDIO_BYTES // (1024*1024)} MB.",
        )

    result = await _audio_service.transcribe(
        audio_bytes=audio_bytes,
        ghost_mode=ghost_mode,
        language=language,
    )

    # Explicitly drop audio bytes from scope (best-effort ephemeral clear)
    AudioService.purge_audio_data(audio_bytes)

    return result


@router.post(
    "/synthesize",
    summary="Text-to-Speech Synthesis",
    description=(
        "Convert a legal response text to spoken audio. "
        "Returns audio/wav bytes for playback in the mobile client."
    ),
    response_class=Response,
    status_code=status.HTTP_200_OK,
)
async def synthesize_speech(
    text: str = Form(..., min_length=1, max_length=5000, description="Text to synthesise."),
    language: str = Form("am", description="BCP-47 language tag: 'am' or 'en'."),
) -> Response:
    """
    Synthesise speech from *text* and return raw audio bytes.

    In the stub implementation this returns an empty WAV payload.
    Wire up Google Cloud Text-to-Speech or a local TTS model for production.
    """
    if language not in ("am", "en"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="language must be 'am' or 'en'.",
        )

    audio_bytes = await _audio_service.synthesize(text=text, language=language)

    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={"X-Session-Purged": "true"},
    )

