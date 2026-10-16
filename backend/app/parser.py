from io import BytesIO
from pypdf import PdfReader

class ResumeParseError(ValueError):
    pass

def extract_pdf_text(content: bytes) -> str:
    if not content:
        raise ResumeParseError("The uploaded file is empty.")
    try:
        reader = PdfReader(BytesIO(content), strict=False)
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception as exc:
                raise ResumeParseError("Password-protected PDFs are not supported.") from exc
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages).strip()
    except ResumeParseError:
        raise
    except Exception as exc:
        raise ResumeParseError("Could not read this PDF. Please upload a valid PDF file.") from exc
    if len(text) < 30:
        raise ResumeParseError(
            "Very little text was extracted. This may be a scanned PDF; OCR is not enabled in this version."
        )
    return text
