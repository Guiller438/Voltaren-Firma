"""
utils.py — Validaciones y helpers reutilizables.
"""

import re
from datetime import date


# ── Validación de cédula ecuatoriana ──────────────────────────────────────────
# Algoritmo oficial del Registro Civil (módulo 10).
# Fuente: https://www.registrocivil.gob.ec
#
# Reglas:
#   1. Exactamente 10 dígitos numéricos.
#   2. Los primeros 2 dígitos = código de provincia (01–24).
#      24 = Santa Elena, máximo válido para cédulas de persona natural.
#   3. El tercer dígito debe ser menor a 6 (0–5 para personas naturales).
#   4. El último dígito es el dígito verificador calculado con módulo 10.


COEFICIENTES = [2, 1, 2, 1, 2, 1, 2, 1, 2]


def validar_cedula(cedula: str) -> tuple[bool, str]:
    """
    Valida una cédula ecuatoriana.

    Returns:
        (True, "")            si es válida
        (False, "motivo")     si es inválida
    """
    cedula = cedula.strip()

    if not cedula.isdigit():
        return False, "La cédula debe contener solo dígitos"

    if len(cedula) != 10:
        return False, f"La cédula debe tener 10 dígitos (recibidos: {len(cedula)})"

    provincia = int(cedula[:2])
    PROVINCIAS_VALIDAS = set(range(1, 25)) | {30}  # 01-24 + 30 (consulados/gobierno central)
    if provincia not in PROVINCIAS_VALIDAS:
        return False, f"Código de provincia inválido ({cedula[:2]})"

    tercer_digito = int(cedula[2])
    if tercer_digito >= 6:
        return False, "El tercer dígito debe ser menor a 6 para personas naturales"

    # Módulo 10
    total = 0
    for i, coef in enumerate(COEFICIENTES):
        val = int(cedula[i]) * coef
        if val >= 10:
            val -= 9
        total += val

    verificador_calculado = (10 - (total % 10)) % 10
    verificador_real = int(cedula[9])

    if verificador_calculado != verificador_real:
        return False, "El dígito verificador no coincide"

    return True, ""


# ── Sanitización de texto ──────────────────────────────────────────────────────

def sanitizar_nombre(nombre: str) -> str:
    """
    Normaliza un nombre:
    - Elimina espacios extra
    - Capitaliza cada palabra
    - Solo permite letras, espacios, tildes y ñ
    """
    nombre = nombre.strip()
    # Eliminar caracteres que no sean letras, espacios o caracteres latinos
    nombre = re.sub(r"[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\']", "", nombre)
    # Colapsar múltiples espacios
    nombre = re.sub(r"\s+", " ", nombre)
    return nombre.strip().title()


def sanitizar_contacto(contacto: str) -> str:
    """Elimina todo excepto dígitos del número de contacto."""
    return re.sub(r"\D", "", contacto.strip())


# ── Fecha formateada para el documento ───────────────────────────────────────

def fecha_documento() -> str:
    """Devuelve la fecha actual en formato '3 de julio de 2025'."""
    meses = [
        "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ]
    hoy = date.today()
    return f"{hoy.day} de {meses[hoy.month]} de {hoy.year}"
