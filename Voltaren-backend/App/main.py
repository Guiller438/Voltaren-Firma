"""
main.py — Aplicación FastAPI principal.

Un solo servicio que:
  • Sirve el frontend React desde /static (build de producción)
  • Expone los endpoints de la API bajo /api/
  • Gestiona el pool de BD y el cliente de Drive con lifespan
"""


from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from App import database, drive
from App.pdf_generator import generar_pdf, nombre_archivo
from App.utils import fecha_documento, sanitizar_contacto, sanitizar_nombre, validar_cedula



# ── Lifespan: arranque y cierre del servidor ───────────────────────────────────
# Reemplaza los eventos @app.on_event("startup") que están deprecados en FastAPI.
# Todo lo que va en el bloque `yield` corre al apagar.

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Arranque
    database.init_pool()
    drive.init_drive()
    yield
    # Cierre
    database.close_pool()


# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Voltaren Firma API",
    version="2.0.0",
    lifespan=lifespan,
    # Ocultar docs en producción si se prefiere:
    # docs_url=None, redoc_url=None,
)

# CORS: en producción solo la URL propia del servidor necesita acceso.
# En desarrollo local añadimos localhost:5173 (Vite dev server).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8000",
        "https://voltaren-firma.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Health check ───────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    """Render y Railway usan este endpoint para saber si el servidor está vivo."""
    return {"status": "ok", "version": "2.0.0"}


# ── Registro de participante ───────────────────────────────────────────────────

@app.post("/api/registro")
async def registro(
    cedula:   str = Form(...),
    nombres:  str = Form(...),
    contacto: str = Form(...),
    firma:    str = Form(...),   # base64 del canvas de firma
):
    """
    Endpoint principal del flujo de firma.

    Recibe los datos del formulario (React) y:
      1. Valida la cédula con el algoritmo módulo 10.
      2. Sanitiza nombre y contacto.
      3. Genera el PDF con el template oficial.
      4. Sube el PDF a Google Drive.
      5. Guarda el registro en PostgreSQL.
      6. Devuelve la URL del PDF al frontend.

    Todos los errores de validación devuelven 400 con un mensaje claro
    para que el frontend pueda mostrárselo al participante en pantalla.
    """

    # 1. Validar cédula
    ok, motivo = validar_cedula(cedula.strip())
    if not ok:
        raise HTTPException(status_code=400, detail=f"Cédula inválida: {motivo}")

    # 3. Sanitizar inputs
    nombre_limpio   = sanitizar_nombre(nombres)
    contacto_limpio = sanitizar_contacto(contacto)

    if not nombre_limpio:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")

    # 4. Generar PDF en el servidor
    try:
        pdf_bytes = generar_pdf(
            nombre  = nombre_limpio,
            cedula  = cedula,
            fecha   = fecha_documento(),
            firma_b64 = firma if firma else None,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 5. Subir a Drive
    pdf_nombre = nombre_archivo(cedula, nombre_limpio)
    url_pdf    = drive.subir_pdf(pdf_bytes, pdf_nombre)

    # 6. Guardar en BD
    try:
        nuevo_id = database.insertar_registro(
            cedula   = cedula,
            nombres  = nombre_limpio,
            contacto = contacto_limpio,
            url_pdf  = url_pdf,
        )
    except Exception as e:
        # Si la BD falla después de subir el PDF a Drive, al menos registramos el error
        # El participante ya firmó — no es justo decirle que fracasó totalmente
        print(f"⚠️ PDF subido a Drive ({url_pdf}) pero falló el guardado en BD: {e}")
        raise HTTPException(
            status_code=500,
            detail="El documento fue generado pero hubo un error al guardarlo. Contacta al organizador.",
        )

    return {
        "mensaje": "Documento registrado exitosamente",
        "id":      nuevo_id,
        "url":     url_pdf,
    }


# ── Panel de administración ────────────────────────────────────────────────────

@app.get("/api/documentos")
def listar_documentos(
    limite: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    """
    Lista los registros con paginación.
    Parámetros: ?limite=100&offset=0

    TODO: agregar autenticación básica antes de exponer en producción.
    Por ahora asumimos que la URL no es pública.
    """
    registros = database.listar_registros(limite=limite, offset=offset)
    total     = database.total_registros()

    # Serializar fechas (datetime no es JSON-serializable por defecto)
    for r in registros:
        if r.get("fecha_registro"):
            r["fecha_registro"] = str(r["fecha_registro"])

    return {
        "total":     total,
        "limite":    limite,
        "offset":    offset,
        "registros": registros,
    }


# ── Frontend estático ──────────────────────────────────────────────────────────
# Esto va al final del archivo porque StaticFiles actúa como catch-all:
# cualquier ruta que no matchee los endpoints de arriba la busca en /static.
# El frontend de React hace client-side routing, así que todas las rutas
# desconocidas deben devolver index.html (SPA fallback).

STATIC_DIR = Path(__file__).parent.parent / "Static"

if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
else:
    print(f"⚠️  Carpeta /static no encontrada — frontend no disponible en esta instancia")
    print(f"   Ejecuta 'npm run build' en el frontend y copia el output a {STATIC_DIR}")
