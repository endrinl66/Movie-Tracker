import httpx

MYMEMORY_URL = "https://api.mymemory.translated.net/get"

async def translate_text(text: str, target_lang: str, source_lang: str = "en") -> str:
    if not text.strip():
        return text

    async with httpx.AsyncClient() as client:
        response = await client.get(
            MYMEMORY_URL,
            params={"q": text, "langpair": f"{source_lang}|{target_lang}"},
        )
        response.raise_for_status()
        data = response.json()

    translated = data.get("responseData", {}).get("translatedText")
    return translated or text