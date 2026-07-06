"""
drive.py — Subida de PDFs a Google Drive usando OAuth de usuario.
"""

import io
import os
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload


SCOPES = ["https://www.googleapis.com/auth/drive.file"]

BASE_DIR = Path(__file__).resolve().parent.parent
CREDENTIALS_PATH = BASE_DIR / "credentials_oauth.json"
TOKEN_PATH = BASE_DIR / "token_drive.json"

FOLDER_ID = os.environ.get("DRIVE_FOLDER_ID", "")
PDF_LOCAL_DIR = BASE_DIR / "pdfs"

_drive_service = None


def init_drive() -> None:
    global _drive_service

    if not CREDENTIALS_PATH.exists():
        print("⚠️ credentials_oauth.json no encontrado — Drive deshabilitado")
        return

    creds = None

    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(
            str(TOKEN_PATH),
            SCOPES
        )

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDENTIALS_PATH),
                SCOPES
            )
            creds = flow.run_local_server(port=0)

        with open(TOKEN_PATH, "w", encoding="utf-8") as token_file:
            token_file.write(creds.to_json())

    _drive_service = build("drive", "v3", credentials=creds)

def subir_pdf(pdf_bytes: bytes, nombre_archivo: str) -> str:
    if _drive_service is None:
        PDF_LOCAL_DIR.mkdir(exist_ok=True)

        ruta_local = PDF_LOCAL_DIR / nombre_archivo

        with open(ruta_local, "wb") as f:
            f.write(pdf_bytes)

        print(f"📄 PDF guardado localmente en: {ruta_local}")

        return f"local://pdfs/{nombre_archivo}"

    if not FOLDER_ID:
        raise RuntimeError("DRIVE_FOLDER_ID no está configurado")

    file_metadata = {
        "name": nombre_archivo,
        "parents": [FOLDER_ID],
    }

    media = MediaIoBaseUpload(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        resumable=False,
    )

    uploaded = _drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id, webViewLink",
    ).execute()

    file_id = uploaded["id"]

    _drive_service.permissions().create(
        fileId=file_id,
        body={
            "role": "reader",
            "type": "anyone",
        },
    ).execute()

    url = uploaded.get("webViewLink") or f"https://drive.google.com/file/d/{file_id}/view"
    return url