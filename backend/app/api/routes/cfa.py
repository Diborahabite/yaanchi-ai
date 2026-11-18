"""
app/api/routes/cfa.py
API endpoints interfacing with the CFA AI Sandbox API.
"""

from fastapi import APIRouter, HTTPException, status
import httpx

from app.models.cfa_models import CFAChatRequest, CFAChatResponse
from app.services.cfa_service import query_sandbox_ai

router = APIRouter()


@router.post(
    "/cfa-chat",
    response_model=CFAChatResponse,
    summary="Query CFA AI Sandbox",
    description="Forward user prompts to the CFA AI Sandbox completions endpoint securely.",
    status_code=status.HTTP_200_OK,
)
async def cfa_chat(request: CFAChatRequest) -> CFAChatResponse:
    try:
        data = await query_sandbox_ai(
            prompt=request.prompt,
            system_prompt=request.system_prompt,
            model=request.model,
        )
        # Extract assistant text if standard OpenAI format
        content = None
        try:
            choices = data.get("choices", [])
            if choices and "message" in choices[0]:
                content = choices[0]["message"].get("content")
        except Exception:
            pass

        return CFAChatResponse(success=True, data=data, content=content)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"CFA Sandbox API error: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to CFA Sandbox API: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error while calling CFA Sandbox: {str(e)}",
        )
