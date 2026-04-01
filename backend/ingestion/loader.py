# backend/ingestion/loader.py

from pathlib import Path
from pypdf import PdfReader
from llama_index.core.schema import Document
import re

def clean_text(text: str) -> str:
    """
    Fixes spaced-out characters from Canva PDFs: 'P y t h o n' → 'Python'
    Only collapses spaces between SINGLE characters, not between words.
    """
    # This regex finds patterns like "P y t h o n" (single chars with spaces)
    # and collapses them, but leaves normal word spacing alone.
    # Pattern: a single non-space char, followed by (space + single non-space char) repeated
    def collapse_spaced_chars(match):
        return match.group(0).replace(' ', '')

    # Match sequences of single characters separated by single spaces
    text = re.sub(r'(?<!\S)(\S)(?: (\S))+(?!\S)', collapse_spaced_chars, text)
    return text


def load_documents(file_paths: list) -> list:
    """
    Loads PDF/text files using pypdf directly.
    pypdf extracts clean text from each page — no raw binary metadata.
    """
    documents = []

    for file_path in file_paths:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        if path.suffix.lower() == ".pdf":
            reader = PdfReader(str(path))
            full_text = ""
            for page in reader.pages:
                full_text += page.extract_text() + "\n"

            full_text = clean_text(full_text)  # add this line
            doc = Document(
                text=full_text,
                metadata={
                    "source_file": path.name,
                    "file_type": path.suffix,
                    "num_pages": len(reader.pages),
                }
            )
            documents.append(doc)
            print(f"Loaded: {path.name} → {len(reader.pages)} page(s)")

        else:
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
            doc = Document(
                text=text,
                metadata={"source_file": path.name, "file_type": path.suffix}
            )
            documents.append(doc)
            print(f"Loaded: {path.name} → 1 page(s)")

    return documents