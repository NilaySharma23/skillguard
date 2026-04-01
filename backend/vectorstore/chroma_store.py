# backend/vectorstore/chroma_store.py

import os
import chromadb
from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.schema import BaseNode

# Import our custom embedding class from chunker
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ingestion.chunker import GoogleGenAIEmbedding

load_dotenv()

CHROMA_PATH = "./chroma_db"


def get_embed_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file")
    return GoogleGenAIEmbedding(api_key=api_key)


def get_or_create_collection(collection_name: str):
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )
    return client, collection


def store_nodes(nodes: list, collection_name: str) -> VectorStoreIndex:
    embed_model = get_embed_model()
    client, collection = get_or_create_collection(collection_name)

    vector_store = ChromaVectorStore(chroma_collection=collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    index = VectorStoreIndex(
        nodes,
        storage_context=storage_context,
        embed_model=embed_model,
    )

    print(f"Stored {len(nodes)} chunks in ChromaDB collection: '{collection_name}'")
    return index


def load_index(collection_name: str) -> VectorStoreIndex:
    embed_model = get_embed_model()
    _, collection = get_or_create_collection(collection_name)

    vector_store = ChromaVectorStore(chroma_collection=collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    index = VectorStoreIndex.from_vector_store(
        vector_store,
        embed_model=embed_model,
    )
    return index


def query_index(index: VectorStoreIndex, query: str, top_k: int = 5) -> list:
    retriever = index.as_retriever(similarity_top_k=top_k)
    nodes = retriever.retrieve(query)

    results = []
    for node in nodes:
        results.append({
            "text": node.text,
            "score": node.score,
            "source": node.metadata.get("source_file", "unknown"),
            "page": node.metadata.get("page_label", "?"),
        })
    return results