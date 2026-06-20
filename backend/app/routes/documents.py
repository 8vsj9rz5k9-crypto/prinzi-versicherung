from __future__ import annotations

import io

from fastapi import APIRouter, HTTPException, UploadFile
from app.models.schemas import Document, DocumentAnalyzeRequest, DocumentCreate, DocumentQARequest
from app.services.agent import agent
from app.services.store import store

router = APIRouter(prefix="/documents", tags=["documents"])


def _extract_text(file: UploadFile) -> str:
    """Extract plain text from an uploaded file (txt or pdf)."""
    content = file.file.read()
    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()

    if content_type == "application/pdf" or filename.endswith(".pdf"):
        try:
            from pypdf import PdfReader  # noqa: PLC0415

            reader = PdfReader(io.BytesIO(content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception:
            return content.decode("utf-8", errors="replace")

    return content.decode("utf-8", errors="replace")


@router.post("", response_model=Document)
async def upload_document(file: UploadFile) -> Document:
    text = _extract_text(file)
    data: dict = {
        "filename": file.filename or "unnamed",
        "content_type": file.content_type or "text/plain",
        "text": text,
        "summary": "",
        "summary_source": "none",
    }
    return Document(**store.create(store.documents, data))


@router.post("/text", response_model=Document)
def create_document_from_text(payload: DocumentCreate) -> Document:
    """Create a document from a plain-text payload (useful for testing)."""
    data = payload.model_dump()
    data.setdefault("summary", "")
    data.setdefault("summary_source", "none")
    return Document(**store.create(store.documents, data))


@router.get("", response_model=list[Document])
def list_documents() -> list[Document]:
    return [Document(**item) for item in store.documents.values()]


@router.get("/{document_id}", response_model=Document)
def get_document(document_id: str) -> Document:
    item = store.documents.get(document_id)
    if not item:
        raise HTTPException(status_code=404, detail="Document not found")
    return Document(**item)


@router.post("/{document_id}/analyze", response_model=Document)
def analyze_document(document_id: str, payload: DocumentAnalyzeRequest | None = None) -> Document:
    if payload is None:
        payload = DocumentAnalyzeRequest()
    item = store.documents.get(document_id)
    if not item:
        raise HTTPException(status_code=404, detail="Document not found")

    if item.get("summary") and not payload.force:
        return Document(**item)

    summary, source = agent.analyze_document(item["text"], item.get("filename", ""))
    updated = store.update(store.documents, document_id, {"summary": summary, "summary_source": source})
    return Document(**updated)  # type: ignore[arg-type]


@router.get("/{document_id}/qa", response_model=dict)
def document_qa(document_id: str, question: str) -> dict:
    item = store.documents.get(document_id)
    if not item:
        raise HTTPException(status_code=404, detail="Document not found")
    answer, source = agent.answer_document_question(item["text"], question)
    return {"document_id": document_id, "question": question, "answer": answer, "source": source}


@router.post("/{document_id}/qa", response_model=dict)
def document_qa_post(document_id: str, payload: DocumentQARequest) -> dict:
    item = store.documents.get(document_id)
    if not item:
        raise HTTPException(status_code=404, detail="Document not found")
    answer, source = agent.answer_document_question(item["text"], payload.question)
    return {"document_id": document_id, "question": payload.question, "answer": answer, "source": source}


@router.delete("/{document_id}")
def delete_document(document_id: str) -> dict[str, bool]:
    deleted = store.delete(store.documents, document_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"deleted": True}
