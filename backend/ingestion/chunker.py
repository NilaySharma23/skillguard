# backend/ingestion/chunker.py

import os
import time
from typing import List, ClassVar
from dotenv import load_dotenv
from google import genai
from llama_index.core.node_parser import SemanticSplitterNodeParser, SentenceSplitter
from llama_index.core.schema import Document
from llama_index.core.embeddings import BaseEmbedding
from pydantic import PrivateAttr

load_dotenv()


class GoogleGenAIEmbedding(BaseEmbedding):
    """
    Custom LlamaIndex embedding wrapper around google-genai SDK.
    
    Important Pydantic detail: LlamaIndex's BaseEmbedding is a Pydantic v2
    model. You cannot add arbitrary instance attributes in __init__ with
    self.x = y — Pydantic will silently drop them or raise validation errors.
    
    The correct pattern is PrivateAttr() — this tells Pydantic "this field
    exists but don't validate or serialize it". You declare it at class level,
    then set it in __init__ using object.__setattr__ or model_post_init.
    This is a key Pydantic v2 pattern you'll see everywhere in LlamaIndex.
    """

    # Declare private attributes at CLASS level — required by Pydantic v2
    _client: any = PrivateAttr()
    _model_name: str = PrivateAttr()
    _last_call_time: float = PrivateAttr(default=0.0)
    _min_interval: float = PrivateAttr(default=1.5)

    def __init__(self, api_key: str, model_name: str = "gemini-embedding-001", **kwargs):
        super().__init__(**kwargs)
        # Use object.__setattr__ to set PrivateAttr values in __init__
        object.__setattr__(self, '_client', genai.Client(api_key=api_key))
        object.__setattr__(self, '_model_name', model_name)
        object.__setattr__(self, '_last_call_time', 0.0)
        object.__setattr__(self, '_min_interval', 1.5)

    def _embed(self, text: str) -> List[float]:
        # Enforce minimum interval between API calls
        elapsed = time.time() - self._last_call_time
        if elapsed < self._min_interval:
            time.sleep(self._min_interval - elapsed)

        response = self._client.models.embed_content(
            model=self._model_name,
            contents=text,
        )
        object.__setattr__(self, '_last_call_time', time.time())
        return response.embeddings[0].values

    def _get_query_embedding(self, query: str) -> List[float]:
        return self._embed(query)

    def _get_text_embedding(self, text: str) -> List[float]:
        return self._embed(text)

    async def _aget_query_embedding(self, query: str) -> List[float]:
        return self._embed(query)

    async def _aget_text_embedding(self, text: str) -> List[float]:
        return self._embed(text)


def get_embed_model(model_name: str = "gemini-embedding-001") -> GoogleGenAIEmbedding:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file")
    return GoogleGenAIEmbedding(api_key=api_key, model_name=model_name)


def chunk_documents(documents: list, use_semantic: bool = True) -> list:
    """
    Two modes:
    - use_semantic=True  → SemanticSplitterNodeParser (smart, uses embeddings, slower)
    - use_semantic=False → SentenceSplitter (fast, no API calls, good fallback)
    
    We default to semantic but fall back gracefully if quota is exhausted.
    """
    if use_semantic:
        print("Using semantic chunking (smart, slower)...")
        embed_model = get_embed_model()
        splitter = SemanticSplitterNodeParser(
            buffer_size=1,
            breakpoint_percentile_threshold=95,
            embed_model=embed_model,
        )
    else:
        print("Using sentence chunking (fast fallback, no API calls)...")
        splitter = SentenceSplitter(
            chunk_size=512,
            chunk_overlap=50,
        )

    nodes = splitter.get_nodes_from_documents(documents)
    print(f"Created {len(nodes)} chunks from {len(documents)} document(s)")
    return nodes