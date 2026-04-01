# backend/test_ingestion.py
# Run this with: python -m backend.test_ingestion

from ingestion.loader import load_documents
from ingestion.chunker import chunk_documents
from vectorstore.chroma_store import store_nodes, query_index
import sys


def run_ingestion_test(resume_paths: list[str], jd_path: str):
    print("\n=== STEP 1: Loading documents ===")
    all_paths = resume_paths + [jd_path]
    documents = load_documents(all_paths)
    print(f"Total documents loaded: {len(documents)}")
    
    print("\n=== STEP 2: Semantic chunking ===")
    nodes = chunk_documents(documents, use_semantic=False)
    for i, node in enumerate(nodes[:3]):  # preview first 3 chunks
        print(f"\nChunk {i+1} (from {node.metadata.get('source_file', '?')}):")
        print(node.text[:200] + "...")
    
    print("\n=== STEP 3: Storing in ChromaDB ===")
    index = store_nodes(nodes, collection_name="skillguard_test")
    
    print("\n=== STEP 4: Test semantic query ===")
    test_queries = [
        "Python and backend experience",
        "machine learning projects",
        "leadership and management skills",
    ]
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        results = query_index(index, query, top_k=2)
        for r in results:
            print(f"  Score {r['score']:.3f} | {r['source']} | {r['text'][:100]}...")
    
    print("\n✓ Phase 1 complete! Ingestion pipeline working.")


if __name__ == "__main__":
    # Usage: python -m backend.test_ingestion resume1.pdf resume2.pdf jd.pdf
    if len(sys.argv) < 3:
        print("Usage: python -m backend.test_ingestion <resume1.pdf> ... <jd.pdf>")
        print("(last argument is always the JD)")
        sys.exit(1)
    
    *resumes, jd = sys.argv[1:]
    run_ingestion_test(resumes, jd)