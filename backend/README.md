# Yanchi AI — Backend

**AI-powered legal guidance and wage calculation platform**  
*Ethiopian Labour Proclamation No. 1156/2019*

---

## Quick Start

```bash
# 1. Enter backend directory
cd backend

# 2. Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env         # Windows
# cp .env.example .env         # macOS / Linux
# Edit .env if needed (OpenAI key is optional)

# 5. Run the server
uvicorn main:app --reload --port 8000
```

API docs at **http://localhost:8000/docs**  
ReDoc at **http://localhost:8000/redoc**

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Root health check |
| `GET` | `/api/v1/health` | Detailed health + version |
| `POST` | `/api/v1/calculate-wage` | Wage & overtime calculator |
| `POST` | `/api/v1/legal-qa` | RAG-powered legal Q&A |
| `POST` | `/api/v1/transcribe` | Amharic audio transcription (stub) |
| `POST` | `/api/v1/synthesize` | Text-to-speech synthesis (stub) |

---

## Wage Calculation Example

```bash
curl -X POST http://localhost:8000/api/v1/calculate-wage \
  -H "Content-Type: application/json" \
  -d '{
    "daily_base_salary": 480.0,
    "standard_overtime_hours": 2.0,
    "rest_day_hours": 1.0
  }'
```

**Response:**
```json
{
  "hourly_rate": 60.0,
  "base_pay": 480.0,
  "standard_overtime_pay": 180.0,
  "rest_day_pay": 120.0,
  "total_pay": 780.0,
  "breakdown": { "standard_hours": 8, "overtime_multiplier": 1.5, "rest_day_multiplier": 2.0, ... },
  "legal_references": ["Proclamation No. 1156/2019, Art. 68 ...", ...],
  "warnings": [],
  "disclaimer": "...",
  "currency": "ETB"
}
```

---

## Running Tests

```bash
# All tests
pytest -v

# Wage logic only
pytest tests/test_wage_calculator.py -v

# API integration tests
pytest tests/test_api.py -v
```

---

## Project Structure

```
backend/
├── main.py                        # FastAPI app entry point
├── requirements.txt
├── .env.example
├── app/
│   ├── config.py                  # Pydantic settings
│   ├── api/routes/
│   │   ├── wage.py                # POST /api/v1/calculate-wage
│   │   ├── legal_qa.py            # POST /api/v1/legal-qa
│   │   └── audio.py               # POST /api/v1/transcribe & /synthesize
│   ├── core/
│   │   ├── wage_calculator.py     # Business logic (Art. 61, 68, 69, 70)
│   │   ├── rag_engine.py          # Retrieval-Augmented Generation
│   │   └── ephemeral_session.py   # Ghost-mode session store
│   ├── models/
│   │   ├── wage_models.py         # Pydantic request/response schemas
│   │   └── legal_models.py
│   ├── services/
│   │   ├── vector_store.py        # TF-IDF keyword search (no external deps)
│   │   └── audio_service.py       # Amharic STT / TTS stubs
│   └── data/
│       └── proclamation_1156_2019.json   # 18 key labour-law articles
└── tests/
    ├── test_wage_calculator.py    # 15 unit tests
    └── test_api.py                # 12 integration tests
```

---

## Legal Basis

All calculations follow **Ethiopian Labour Proclamation No. 1156/2019**:

| Article | Topic | Rule |
|---------|-------|------|
| Art. 61 | Normal Hours | Max 8 hrs/day, 48 hrs/week |
| Art. 68 | Standard Overtime | **1.5×** normal hourly rate |
| Art. 69 | Rest-Day / Holiday | **2.0×** normal hourly rate |
| Art. 70 | Overtime Limits | Max **2 hrs/day**, **10 hrs/week** |
| Art. 67 | Maternity Leave | 90 consecutive days |
| Art. 65 | Annual Leave | 1 day per month of service |

---

## Production Upgrade Notes

- **Audio transcription**: Replace stub in `audio_service.py` with Google Cloud Speech-to-Text (`am-ET` locale) or a Whisper model.
- **Text-to-speech**: Integrate Google Cloud TTS or a local Amharic TTS model.
- **Vector search**: Swap `SimpleVectorStore` for ChromaDB + `sentence-transformers` for semantic search.
- **LLM answers**: Add OpenAI / Gemini API key to `.env` for GPT/Gemini-powered answer generation.

