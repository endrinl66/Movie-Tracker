from pydantic import BaseModel, Field

class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    target_lang: str = Field(..., min_length=2, max_length=5)

class TranslateResponse(BaseModel):
    translated_text: str