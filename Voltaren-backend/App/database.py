"""
database.py — Pool de conexiones PostgreSQL y todas las queries del sistema.

Por qué pool en lugar de una conexión global:
  - Una conexión global es un recurso compartido entre todos los requests.
  - Si se cae (timeout, error de red), el servidor entero falla hasta que se reinicia.
  - Un pool mantiene varias conexiones vivas. Si una falla, el request siguiente
    obtiene otra. Si la BD está ocupada, el request espera en cola en lugar de fallar.
"""

import os
import psycopg2
from psycopg2 import pool
from contextlib import contextmanager


# ── Pool global ────────────────────────────────────────────────────────────────
# Se crea una vez al arrancar el servidor (en el lifespan de FastAPI).
# minconn=2  → siempre hay 2 conexiones listas aunque no haya tráfico.
# maxconn=15 → nunca más de 15 simultáneas; las extra esperan en cola.
_pool: pool.ThreadedConnectionPool | None = None


def init_pool() -> None:
    """Inicializa el pool. Llamar una sola vez al arrancar la app."""
    global _pool
    _pool = pool.ThreadedConnectionPool(
        minconn=2,
        maxconn=15,
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        host=os.environ["DB_HOST"],
        port=os.environ.get("DB_PORT", "5432"),
        # UTF-8 explícito para evitar que tildes y ñ se corrompan.
        options="-c client_encoding=UTF8 -c timezone=America/Guayaquil",
    )


def close_pool() -> None:
    """Cierra todas las conexiones. Llamar al apagar la app."""
    if _pool:
        _pool.closeall()


@contextmanager
def get_conn():
    """
    Context manager que entrega una conexión del pool y la devuelve al salir.

    Uso:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(...)
                conn.commit()

    Si ocurre cualquier excepción dentro del bloque, hace rollback automático
    antes de devolver la conexión al pool, dejándola limpia para el próximo uso.
    """
    conn = _pool.getconn()
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


# ── Queries ────────────────────────────────────────────────────────────────────

def cedula_ya_existe(cedula: str) -> bool:
    """Devuelve True si la cédula ya tiene un registro en la BD."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM documentos_firmados WHERE cedula = %s LIMIT 1",
                (cedula,),
            )
            return cur.fetchone() is not None


def insertar_registro(
    cedula: str,
    nombres: str,
    contacto: str,
    url_pdf: str,
) -> int:
    """
    Inserta un nuevo registro y devuelve el ID generado.
    Falla con IntegrityError si la cédula ya existe (constraint UNIQUE en BD).
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO documentos_firmados
                    (cedula, nombres, ruta_pdf, fecha_registro, contacto)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP, %s)
                RETURNING id
                """,
                (cedula, nombres, url_pdf, contacto),
            )
            nuevo_id = cur.fetchone()[0]
            conn.commit()
            return nuevo_id


def listar_registros(limite: int = 500, offset: int = 0) -> list[dict]:
    """
    Devuelve los registros más recientes con paginación básica.
    límite por defecto 500 para no saturar una respuesta única.
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, cedula, nombres, ruta_pdf,
                       fecha_registro, contacto
                FROM documentos_firmados
                ORDER BY id DESC
                LIMIT %s OFFSET %s
                """,
                (limite, offset),
            )
            cols = ["id", "cedula", "nombres", "ruta_pdf", "fecha_registro", "contacto"]
            return [dict(zip(cols, row)) for row in cur.fetchall()]


def total_registros() -> int:
    """Cuenta total de registros (para paginación en el panel admin)."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM documentos_firmados")
            return cur.fetchone()[0]
