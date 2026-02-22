"""
Synapto Backend - AI Accessibility Platform
FastAPI server with PDF extraction, Whisper ASR, and LLM text simplification.
"""

import os
import json
import tempfile
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("synapto")

app = FastAPI(
    title="Synapto API",
    description="AI-Powered Accessibility Platform Backend",
    version="1.0.0",
)

# CORS - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ───────────────────────────── Config ─────────────────────────────
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

# Lazy-loaded heavy modules
_whisper_model = None
_openai_client = None


def get_openai_client():
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI
        _openai_client = OpenAI(api_key=OPENAI_API_KEY)
    return _openai_client


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        logger.info(f"Loading Whisper model: {WHISPER_MODEL_SIZE}")
        _whisper_model = whisper.load_model(WHISPER_MODEL_SIZE)
        logger.info("Whisper model loaded.")
    return _whisper_model


# ───────────────────────────── Models ─────────────────────────────
class SimplifyRequest(BaseModel):
    text: str
    level: int = 2  # 1=Grade3, 2=Grade6, 3=Grade9, 4=Grade12
    provider: Optional[str] = None  # override AI_PROVIDER


class SimplifyResponse(BaseModel):
    original: str
    simplified: str
    original_word_count: int
    simplified_word_count: int
    grade_level: str
    provider_used: str


class SignGlossRequest(BaseModel):
    text: str
    sign_language: str = "asl"


class SignGlossResponse(BaseModel):
    original: str
    gloss: str
    letters: list[str]
    word_signs: list[dict]


class TranscriptionResponse(BaseModel):
    text: str
    language: str
    duration: float


# ───────────────────── Text Simplification ─────────────────────
SIMPLIFY_PROMPTS = {
    1: "Rewrite the following text so a child in grade 3 (age 8-9) can understand it. Use very simple words, short sentences, and explain any hard ideas. Keep it friendly and clear.",
    2: "Rewrite the following text for a grade 6 (age 11-12) reading level. Use simple language, avoid jargon, and keep sentences under 20 words. Explain technical terms simply.",
    3: "Rewrite the following text for a grade 9 (age 14-15) reading level. Simplify complex vocabulary and break long sentences into shorter ones. Keep technical accuracy.",
    4: "Rewrite the following text for a grade 12 (age 17-18) reading level. Simplify overly academic language while maintaining precision. Replace jargon with common equivalents where possible.",
}


async def simplify_with_openai(text: str, level: int) -> str:
    """Use OpenAI GPT to simplify text."""
    client = get_openai_client()
    prompt = SIMPLIFY_PROMPTS.get(level, SIMPLIFY_PROMPTS[2])

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": f"{prompt}\n\nIMPORTANT: Only return the simplified text. Do not add any preamble, explanation, or metadata.",
            },
            {"role": "user", "content": text},
        ],
        temperature=0.4,
        max_tokens=2000,
    )
    return response.choices[0].message.content.strip()


async def simplify_with_huggingface(text: str, level: int) -> str:
    """Use Hugging Face Inference API to simplify text."""
    import requests

    prompt = SIMPLIFY_PROMPTS.get(level, SIMPLIFY_PROMPTS[2])
    full_prompt = f"{prompt}\n\nOriginal text:\n{text}\n\nSimplified text:"

    # Use a strong instruction-following model
    api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

    payload = {
        "inputs": f"<s>[INST] {full_prompt} [/INST]",
        "parameters": {
            "max_new_tokens": 1500,
            "temperature": 0.4,
            "return_full_text": False,
        },
    }

    resp = requests.post(api_url, headers=headers, json=payload, timeout=60)
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Hugging Face API error: {resp.text}")

    result = resp.json()
    if isinstance(result, list) and len(result) > 0:
        return result[0].get("generated_text", "").strip()
    raise HTTPException(status_code=502, detail="Unexpected HF API response format")


async def simplify_fallback(text: str, level: int) -> str:
    """Rule-based fallback when no API key is available."""
    replacements = {
        "necessitates": "needs", "multifaceted": "many-sided",
        "encompasses": "includes", "systematically": "carefully",
        "evaluate": "check", "infrastructure": "systems",
        "remediate": "fix", "impede": "block", "equitable": "fair",
        "promulgated": "created", "delineate": "describe",
        "comprehensive": "complete", "implementation": "use",
        "individuals": "people", "facilitate": "help",
        "methodology": "method", "fundamental": "basic",
        "predominantly": "mainly", "approximately": "about",
        "demonstrate": "show", "utilizing": "using",
        "subsequently": "then", "furthermore": "also",
        "additionally": "also", "consequently": "so",
        "nevertheless": "but", "notwithstanding": "despite",
        "aforementioned": "mentioned", "henceforth": "from now on",
        "whereby": "where", "thereof": "of that",
        "pursuant": "following", "commenced": "started",
        "terminated": "ended", "endeavor": "try",
        "ascertain": "find out", "procure": "get",
        "disseminate": "share", "elucidate": "explain",
        "ameliorate": "improve", "exacerbate": "worsen",
        "proliferate": "spread", "substantiate": "prove",
        "corroborate": "confirm", "juxtapose": "compare",
    }

    import re
    result = text
    intensity = (5 - level) / 4
    entries = list(replacements.items())
    count = int(len(entries) * (0.3 + intensity * 0.7))

    for complex_word, simple_word in entries[:count]:
        result = re.sub(complex_word, simple_word, result, flags=re.IGNORECASE)

    if level <= 2:
        result = re.sub(r"\([^)]+\)", "", result)
        sentences = [s.strip() for s in re.split(r"[.!?]+", result) if s.strip()]
        result = ". ".join(
            " ".join(s.split()[:18]) if len(s.split()) > 20 else s
            for s in sentences
        ) + "."

    return result


# ───────────────────── PDF Extraction ─────────────────────
def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using PyMuPDF (fitz)."""
    import fitz  # PyMuPDF

    text_parts = []
    doc = fitz.open(file_path)
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        if text.strip():
            text_parts.append(f"--- Page {page_num + 1} ---\n{text.strip()}")

    doc.close()

    if not text_parts:
        raise HTTPException(status_code=422, detail="Could not extract text from PDF. The file may be image-based (try OCR).")

    return "\n\n".join(text_parts)


# ───────────────────── Sign Language Glossing ─────────────────────
# ASL gloss rules: remove function words, reorder to Topic-Comment
ASL_SKIP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "am", "be", "been",
    "being", "to", "of", "and", "but", "or", "for", "nor", "on", "at",
    "by", "with", "in", "it", "its", "this", "that", "these", "those",
    "do", "does", "did", "has", "have", "had", "will", "would", "shall",
    "should", "may", "might", "can", "could", "must",
}

# Common ASL sign vocabulary with descriptions
ASL_SIGNS = {
    "hello": {"sign": "HELLO", "description": "Open hand waves from forehead outward", "type": "greeting"},
    "thank": {"sign": "THANK-YOU", "description": "Flat hand from chin forward", "type": "expression"},
    "you": {"sign": "YOU", "description": "Point index finger forward", "type": "pronoun"},
    "help": {"sign": "HELP", "description": "Fist on open palm, lift upward", "type": "verb"},
    "please": {"sign": "PLEASE", "description": "Flat hand circles on chest", "type": "expression"},
    "sorry": {"sign": "SORRY", "description": "Fist circles on chest", "type": "expression"},
    "love": {"sign": "LOVE", "description": "Cross arms over chest", "type": "emotion"},
    "good": {"sign": "GOOD", "description": "Flat hand from chin to open palm", "type": "adjective"},
    "bad": {"sign": "BAD", "description": "Flat hand from chin, flip downward", "type": "adjective"},
    "morning": {"sign": "MORNING", "description": "Arm rises like sun from elbow", "type": "time"},
    "night": {"sign": "NIGHT", "description": "Dominant hand arcs downward over base", "type": "time"},
    "name": {"sign": "NAME", "description": "H-handshape taps twice", "type": "noun"},
    "want": {"sign": "WANT", "description": "Claw hands pull toward body", "type": "verb"},
    "need": {"sign": "NEED", "description": "X-handshape bends downward", "type": "verb"},
    "understand": {"sign": "UNDERSTAND", "description": "Index flicks up near forehead", "type": "verb"},
    "learn": {"sign": "LEARN", "description": "Grab from open palm to forehead", "type": "verb"},
    "school": {"sign": "SCHOOL", "description": "Clap hands twice", "type": "noun"},
    "work": {"sign": "WORK", "description": "Fists tap together twice", "type": "verb"},
    "home": {"sign": "HOME", "description": "Flat O from chin to cheek", "type": "noun"},
    "family": {"sign": "FAMILY", "description": "F-hands circle outward", "type": "noun"},
    "friend": {"sign": "FRIEND", "description": "Index fingers hook together", "type": "noun"},
    "eat": {"sign": "EAT", "description": "Flat O taps mouth", "type": "verb"},
    "drink": {"sign": "DRINK", "description": "C-hand tips toward mouth", "type": "verb"},
    "water": {"sign": "WATER", "description": "W-handshape taps chin", "type": "noun"},
    "yes": {"sign": "YES", "description": "S-hand nods", "type": "response"},
    "no": {"sign": "NO", "description": "Index and middle finger snap to thumb", "type": "response"},
    "what": {"sign": "WHAT", "description": "Open hands palms up, shake", "type": "question"},
    "where": {"sign": "WHERE", "description": "Index finger wags side to side", "type": "question"},
    "when": {"sign": "WHEN", "description": "Index circles then touches other index", "type": "question"},
    "who": {"sign": "WHO", "description": "Index circles mouth", "type": "question"},
    "how": {"sign": "HOW", "description": "Fists roll outward, open up", "type": "question"},
    "more": {"sign": "MORE", "description": "Flat O hands tap together", "type": "quantity"},
    "again": {"sign": "AGAIN", "description": "Bent hand arcs into open palm", "type": "adverb"},
    "happy": {"sign": "HAPPY", "description": "Flat hand brushes chest upward twice", "type": "emotion"},
    "sad": {"sign": "SAD", "description": "Open hands slide down face", "type": "emotion"},
    "big": {"sign": "BIG", "description": "L-hands move apart", "type": "adjective"},
    "small": {"sign": "SMALL", "description": "Flat hands move together", "type": "adjective"},
}


def text_to_asl_gloss(text: str) -> dict:
    """Convert English text to ASL gloss notation."""
    import re
    words = re.findall(r"[a-zA-Z']+", text.lower())
    gloss_words = []
    word_signs = []

    for word in words:
        if word in ASL_SKIP_WORDS:
            continue

        base = word.rstrip("s").rstrip("ed").rstrip("ing")

        if word in ASL_SIGNS:
            sign_info = ASL_SIGNS[word]
            gloss_words.append(sign_info["sign"])
            word_signs.append({
                "word": word,
                "sign": sign_info["sign"],
                "description": sign_info["description"],
                "type": sign_info["type"],
                "method": "vocabulary",
            })
        elif base in ASL_SIGNS:
            sign_info = ASL_SIGNS[base]
            gloss_words.append(sign_info["sign"])
            word_signs.append({
                "word": word,
                "sign": sign_info["sign"],
                "description": sign_info["description"],
                "type": sign_info["type"],
                "method": "vocabulary",
            })
        else:
            # Fingerspell unknown words
            gloss_words.append(f"#{word.upper()}")
            word_signs.append({
                "word": word,
                "sign": f"#{word.upper()}",
                "description": f"Fingerspell: {' - '.join(word.upper())}",
                "type": "fingerspell",
                "method": "fingerspell",
                "letters": list(word.upper()),
            })

    return {
        "gloss": " ".join(gloss_words),
        "word_signs": word_signs,
        "letters": list(text.upper().replace(" ", "")),
    }


# ───────────────────── API Routes ─────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "service": "Synapto API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "ai_provider": AI_PROVIDER,
        "openai_configured": bool(OPENAI_API_KEY and OPENAI_API_KEY != "sk-your-openai-key-here"),
        "huggingface_configured": bool(HF_API_TOKEN and HF_API_TOKEN != "hf_your-token-here"),
        "whisper_model": WHISPER_MODEL_SIZE,
    }


@app.post("/api/simplify", response_model=SimplifyResponse)
async def simplify_text(request: SimplifyRequest):
    """Simplify text using LLM (OpenAI or Hugging Face)."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    provider = request.provider or AI_PROVIDER
    grade_map = {1: "Grade 3", 2: "Grade 6", 3: "Grade 9", 4: "Grade 12"}

    try:
        if provider == "openai" and OPENAI_API_KEY and OPENAI_API_KEY != "sk-your-openai-key-here":
            simplified = await simplify_with_openai(request.text, request.level)
            used = f"OpenAI ({OPENAI_MODEL})"
        elif provider == "huggingface" and HF_API_TOKEN and HF_API_TOKEN != "hf_your-token-here":
            simplified = await simplify_with_huggingface(request.text, request.level)
            used = "Hugging Face (Mistral-7B)"
        else:
            # Fallback to rule-based
            simplified = await simplify_fallback(request.text, request.level)
            used = "Rule-based (no API key configured)"
            logger.warning("No API key configured. Using rule-based fallback. Set OPENAI_API_KEY or HF_API_TOKEN in .env")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI simplification failed: {e}")
        simplified = await simplify_fallback(request.text, request.level)
        used = f"Rule-based fallback (AI error: {str(e)[:80]})"

    return SimplifyResponse(
        original=request.text,
        simplified=simplified,
        original_word_count=len(request.text.split()),
        simplified_word_count=len(simplified.split()),
        grade_level=grade_map.get(request.level, "Grade 6"),
        provider_used=used,
    )


@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    """Extract text from uploaded PDF using PyMuPDF."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        text = extract_text_from_pdf(tmp_path)
        word_count = len(text.split())
        return {
            "filename": file.filename,
            "text": text,
            "word_count": word_count,
            "page_count": text.count("--- Page"),
        }
    finally:
        os.unlink(tmp_path)


@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio using OpenAI Whisper."""
    allowed = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm", ".mp4"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format. Allowed: {', '.join(allowed)}")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        model = get_whisper_model()
        result = model.transcribe(tmp_path)
        return TranscriptionResponse(
            text=result["text"].strip(),
            language=result.get("language", "en"),
            duration=result.get("duration", 0),
        )
    except Exception as e:
        logger.error(f"Whisper transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        os.unlink(tmp_path)


@app.post("/api/sign-gloss", response_model=SignGlossResponse)
async def get_sign_gloss(request: SignGlossRequest):
    """Convert text to sign language gloss notation with sign descriptions."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    result = text_to_asl_gloss(request.text)

    return SignGlossResponse(
        original=request.text,
        gloss=result["gloss"],
        letters=result["letters"],
        word_signs=result["word_signs"],
    )


@app.get("/api/sign-vocabulary")
async def get_sign_vocabulary():
    """Get available sign language vocabulary."""
    return {
        "total_signs": len(ASL_SIGNS),
        "signs": {
            word: {
                "sign": info["sign"],
                "description": info["description"],
                "type": info["type"],
            }
            for word, info in ASL_SIGNS.items()
        },
    }


# Serve frontend static files
FRONTEND_DIR = Path(__file__).parent.parent
if (FRONTEND_DIR / "index.html").exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/app")
    async def serve_frontend():
        return FileResponse(str(FRONTEND_DIR / "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
