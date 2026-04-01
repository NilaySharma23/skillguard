# backend/test_pipeline.py

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from ingestion.loader import load_documents
from crew.pipeline import screen_candidate
import json


def main():
    if len(sys.argv) < 3:
        print("Usage: python test_pipeline.py resume.pdf jd.pdf")
        sys.exit(1)

    resume_path, jd_path = sys.argv[1], sys.argv[2]

    print("Loading documents...")
    docs = load_documents([resume_path, jd_path])

    resume_text = next(d.text for d in docs if "resume" in d.metadata["source_file"].lower())
    jd_text = next(d.text for d in docs if d.metadata["source_file"] != 
                   next(d2.metadata["source_file"] for d2 in docs 
                        if "resume" in d2.metadata["source_file"].lower()))

    report = screen_candidate(resume_text, jd_text)

    print("\n" + "="*50)
    print("FINAL REPORT")
    print("="*50)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()