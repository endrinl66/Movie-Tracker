from fastapi import APIRouter, HTTPException
from app.services import translate_client
from app.schemas.translate import TranslateRequest, TranslateResponse

router = APIRouter(prefix="/translate", tags=["translate"])

@router.post("", response_model=TranslateResponse)
async def translate(request: TranslateRequest):
    try:
        translated = await translate_client.translate_text(request.text, request.target_lang)
        return {"translated_text": translated}
    except Exception:
        raise HTTPException(status_code=502, detail="Translation service unavailable")