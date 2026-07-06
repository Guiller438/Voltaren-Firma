"""
drive.py — Subida de PDFs a Google Drive.

Soporta:
1. Producción en Render usando variables de entorno:
   - GOOGLE_OAUTH_CREDENTIALS
   - GOOGLE_TOKEN_JSON

2. Desarrollo local usando archivos:
   - credentials_oauth.json
   - token_drive.json

3. Fallback local si Drive no está configurado.
"""

import io
import json
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


def _cargar_oauth_credentials():
    """
    Carga credenciales OAuth desde variable de entorno o archivo local.
    """
    oauth_env = os.environ.get("GOOGLE_OAUTH_CREDENTIALS")

    if oauth_env:
        return json.loads(oauth_env)

    if CREDENTIALS_PATH.exists():
        with open(CREDENTIALS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    return None


def _cargar_token():
    """
    Carga token OAuth desde variable de entorno o archivo local.
    """
    token_env = os.environ.get("GOOGLE_TOKEN_JSON")

    if token_env:
        return Credentials.from_authorized_user_info(
            json.loads(token_env),
            SCOPES,
        )

    if TOKEN_PATH.exists():
        return Credentials.from_authorized_user_file(
            str(TOKEN_PATH),
            SCOPES,
        )

    return None


def _guardar_token_local(creds: Credentials) -> None:
    """
    Guarda token localmente solo en desarrollo.
    En Render no se debe escribir token persistente.
    """
    if os.environ.get("GOOGLE_TOKEN_JSON"):
        return

    with open(TOKEN_PATH, "w", encoding="utf-8") as token_file:
        token_file.write(creds.to_json())


def init_drive() -> None:
    global _drive_service

    oauth_credentials = _cargar_oauth_credentials()
    creds = _cargar_token()

    if not oauth_credentials:
        print("⚠️ OAuth credentials no configuradas — Drive deshabilitado")
        return

    if not creds:
        print("⚠️ Token OAuth no configurado — Drive deshabilitado")
        print("   En local ejecuta OAuth para generar token_drive.json.")
        print("   En Render configura GOOGLE_TOKEN_JSON.")
        return

    if not creds.valid:
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            _guardar_token_local(creds)
        else:
            print("⚠️ Token OAuth inválido y no se puede refrescar — Drive deshabilitado")
            return

    _drive_service = build("drive", "v3", credentials=creds)


def subir_pdf(pdf_bytes: bytes, nombre_archivo: str) -> str:
    if _drive_service is None:
        PDF_LOCAL_DIR.mkdir(exist_ok=True)

        ruta_local = PDF_LOCAL_DIR / nombre_archivo

        with open(ruta_local, "wb") as f:
            f.write(pdf_bytes)

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

    url = uploaded.get(
        "webViewLink",
        f"https://drive.google.com/file/d/{file_id}/view",
    )
    return url