# backend/cache.py

import os
import json
import hashlib

CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache")


def _ensure_dir():
    os.makedirs(CACHE_DIR, exist_ok=True)


def resume_hash(resume_text: str) -> str:
    """SHA-256 hash of resume text — used as cache key."""
    return hashlib.sha256(resume_text.encode("utf-8")).hexdigest()


def get_cached(hash_key: str) -> dict | None:
    """
    Returns cached agent 1-3 output for a resume if it exists.
    Returns: {parsed_claims, verified_claims, audited_claims} or None
    """
    path = os.path.join(CACHE_DIR, f"{hash_key}.json")
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            print(f"  [Cache] HIT — skipping agents 1-3 for {hash_key[:12]}…")
            return data
        except Exception:
            return None
    return None


def set_cache(hash_key: str, data: dict):
    """
    Saves agent 1-3 output to disk.
    data should contain: parsed_claims, verified_claims, audited_claims
    """
    _ensure_dir()
    path = os.path.join(CACHE_DIR, f"{hash_key}.json")
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"  [Cache] Saved results for {hash_key[:12]}…")
    except Exception as e:
        print(f"  [Cache] Failed to save: {e}")
