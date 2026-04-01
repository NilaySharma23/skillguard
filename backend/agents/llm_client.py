# backend/agents/llm_client.py

import os
import time
import json
from dotenv import load_dotenv

load_dotenv()


def get_client():
    """
    Returns a Groq client — our primary LLM provider.
    Groq runs open-source models (Llama 3.3 70B) on custom hardware
    called LPUs (Language Processing Units). Insanely fast, generous
    free tier, and no vendor lock-in because the models are open weights.
    
    This is the abstraction layer pattern: the rest of the codebase
    calls generate() and never knows or cares which provider is underneath.
    Swap Groq for Gemini, OpenAI, or a local Ollama instance by changing
    this one file. Nothing else changes.
    """
    from groq import Groq
    return Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate(prompt: str, model: str = "llama-3.3-70b-versatile", retries: int = 4) -> str:
    """
    Primary LLM call with exponential backoff retry.
    
    Model choice: llama-3.3-70b-versatile
    - 70B parameters — strong reasoning, good at structured JSON output
    - Free tier: 14,400 requests/day, 6,000 tokens/minute
    - Open weights: Meta released this publicly, Groq just runs it fast
    
    Why not gemini-2.0-flash? We keep it as a fallback (see below).
    Daily limit of ~50 requests on free tier made development impossible.
    """
    client = get_client()
    delay = 2

    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,  # low temp = more consistent JSON output
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "rate_limit" in error_str.lower():
                if attempt < retries - 1:
                    print(f"  Rate limited — waiting {delay}s before retry...")
                    time.sleep(delay)
                    delay *= 2
                else:
                    raise
            else:
                raise

    return ""


def generate_with_fallback(prompt: str) -> str:
    """
    Tries Groq first, falls back to Gemini if Groq fails.
    This is the multi-provider pattern real systems use.
    """
    try:
        return generate(prompt)
    except Exception as groq_error:
        print(f"  Groq failed ({groq_error}), trying Gemini fallback...")
        try:
            from google import genai
            client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            return response.text.strip()
        except Exception as gemini_error:
            raise RuntimeError(
                f"Both providers failed. Groq: {groq_error}. Gemini: {gemini_error}"
            )


def parse_json_response(text: str) -> dict:
    """
    Strips markdown code fences and parses JSON.
    Handles the common LLM habit of wrapping JSON in ```json blocks.
    """
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (```json) and last line (```)
        text = "\n".join(lines[1:-1])
    return json.loads(text.strip())