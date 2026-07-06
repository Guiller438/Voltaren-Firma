"""
pdf_generator.py — Genera el PDF de liberación de responsabilidad.
Usa reportlab directamente, sin depender de LibreOffice.
"""

import base64
import io
import os
from pathlib import Path

from PIL import Image

from reportlab.lib.colors import HexColor, black
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


W, H = A4
MARGIN = 25 * mm
LINE_W = W - 2 * MARGIN

HALEON_CONTACTO = os.environ.get(
    "HALEON_CONTACTO",
    "haleon.ecuador@haleon.com",
)

TEMPLATE_PATH = Path(__file__).parent.parent / "templates" / "template.docx"


def _wrap_text(text: str, max_chars: int) -> list[str]:
    words = text.split()
    lines = []
    current = ""

    for word in words:
        if len(current) + len(word) + 1 <= max_chars:
            current = (current + " " + word).strip()
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    return lines


def _draw_paragraph(
    c,
    text: str,
    x: float,
    y: float,
    width: float,
    font: str = "Helvetica",
    size: float = 10,
    line_height: float = 13,
    color=black,
) -> float:
    c.setFont(font, size)
    c.setFillColor(color)

    chars_per_line = int(width / (size * 0.52))
    lines = _wrap_text(text, chars_per_line)

    for line in lines:
        c.drawString(x, y, line)
        y -= line_height

    return y


def _preparar_firma(firma_b64: str):
    if "," in firma_b64:
        firma_b64 = firma_b64.split(",", 1)[1]

    firma_bytes = base64.b64decode(firma_b64)

    img = Image.open(io.BytesIO(firma_bytes)).convert("RGBA")

    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    bg.paste(img, mask=img.split()[3])

    img_final = bg.convert("RGB")

    img_buf = io.BytesIO()
    img_final.save(img_buf, format="PNG")
    img_buf.seek(0)

    return ImageReader(img_buf)


def generar_pdf(
    nombre: str,
    cedula: str,
    fecha: str,
    firma_b64: str | None = None,
) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)

    c.setFont("Helvetica-Bold", 22)
    c.setFillColor(HexColor("#1D1D1B"))
    c.drawRightString(W - MARGIN, H - 20 * mm, "HALEON")

    c.setStrokeColor(HexColor("#E8622A"))
    c.setLineWidth(1.5)
    c.line(W - MARGIN - 60 * mm, H - 22 * mm, W - MARGIN, H - 22 * mm)

    y = H - 35 * mm

    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(black)

    title = "Liberación de Responsabilidad"
    c.drawCentredString(W / 2, y, title)

    title_w = c.stringWidth(title, "Helvetica-Bold", 13)
    c.setStrokeColor(black)
    c.setLineWidth(0.8)
    c.line(W / 2 - title_w / 2, y - 2, W / 2 + title_w / 2, y - 2)

    y -= 12 * mm

    parrafos = [
        (
            f'Por la presente, yo, {nombre}, en pleno uso de mis facultades, declaro que '
            f'participo voluntariamente en la actividad "La Ruta de las Iglesias" organizada '
            f'por TVENTAS. Entiendo y acepto que mi participación en esta actividad es '
            f'voluntaria y bajo mi propio riesgo.'
        ),
        (
            "Reconozco que HALEON no es responsable de ningún daño, lesión o efecto adverso "
            "que pueda resultar del uso de VOLTAREN durante o después de la actividad. "
            "Entiendo que es mi responsabilidad consultar con un profesional de la salud "
            "antes de usar VOLTAREN, especialmente en caso de tener condiciones médicas "
            "preexistentes o de estar usando otros medicamentos o productos que pudiesen "
            "interferir con el uso de VOLTAREN."
        ),
        (
            "Al firmar este documento, libero a HALEON, sus empleados, agentes, representantes "
            "y afiliados de cualquier responsabilidad por reclamaciones, demandas, daños o "
            "acciones legales que puedan surgir en relación con mi participación en la "
            "actividad y el uso y aplicación de VOLTAREN."
        ),
        (
            "Además, el suscrito en pleno uso de mis facultades, otorgo mi consentimiento "
            "libre, previo, expreso e informado a Haleon, para que realice el tratamiento de "
            "mis datos personales exclusivamente para efectos de llevar el registro de las "
            "liberaciones de responsabilidad de los suscritas por los participantes en el "
            'marco de la actividad "La Ruta de las Iglesias".'
        ),
        (
            'Para lo cual se entenderá como "Datos Personales Recopilados": a) Nombre '
            "completo y b) Número de identificación c) correo electrónico. Haleon se "
            "compromete a almacenar los datos personales de manera segura y a implementar "
            "las medidas técnicas y organizativas necesarias para protegerlos contra el "
            "acceso no autorizado, pérdida o destrucción."
        ),
        (
            f"Como titular de los datos, tengo derecho a acceder, rectificar u oponerme al "
            f"tratamiento de mis datos personales, conforme a la legislación vigente. Para "
            f"ejercer estos derechos, puedo comunicarme a través de {HALEON_CONTACTO}."
        ),
        (
            "La autorización para el tratamiento de mis datos personales se mantendrá "
            "vigente mientras sea necesario para cumplir con las finalidades mencionadas."
        ),
        (
            "Confirmo que he leído y comprendido completamente los términos de esta "
            "liberación de responsabilidad, que conozco de las precauciones y advertencias "
            "del producto, y, que conozco que el producto es clasificado como medicamento. "
            "En virtud de lo anterior firmo de manera voluntaria y consciente esta "
            "liberación de responsabilidad."
        ),
    ]

    for parrafo in parrafos:
        y = _draw_paragraph(
            c,
            parrafo,
            MARGIN,
            y,
            LINE_W,
            font="Helvetica",
            size=10,
            line_height=13,
        )
        y -= 5

        if y < 95 * mm:
            c.showPage()
            y = H - 25 * mm

    y -= 35 * mm

    if y < 60 * mm:
        c.showPage()
        y = H - 60 * mm

    firma_label_y = y

    linea_inicio = MARGIN + 52 * mm
    linea_fin = MARGIN + 105 * mm

    if firma_b64:
        try:
            firma_reader = _preparar_firma(firma_b64)

            firma_w = 50 * mm
            firma_h = 18 * mm

            firma_x = linea_inicio + ((linea_fin - linea_inicio) - firma_w) / 2
            firma_y = firma_label_y - 4 * mm

            c.drawImage(
                firma_reader,
                firma_x,
                firma_y,
                width=firma_w,
                height=firma_h,
                preserveAspectRatio=True,
                mask="auto",
            )

        except Exception as e:
            print(f"⚠️ No se pudo embeber la firma: {e}")

    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(black)
    c.drawString(MARGIN, firma_label_y, "Firma del Participante:")

    c.setStrokeColor(black)
    c.setLineWidth(0.8)
    c.line(linea_inicio, firma_label_y - 1, linea_fin, firma_label_y - 1)

    y = firma_label_y - 8 * mm

    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN, y, "Nombre del Participante:")
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN + 54 * mm, y, nombre)

    y -= 8 * mm

    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN, y, "Cédula:")
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN + 20 * mm, y, cedula)

    y -= 8 * mm

    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN, y, "Fecha:")
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN + 17 * mm, y, fecha)

    c.save()
    buf.seek(0)

    return buf.read()


def nombre_archivo(cedula: str, nombre: str) -> str:
    primer_nombre = nombre.split()[0] if nombre else "participante"
    return f"{cedula}_Liberacion_Voltaren_{primer_nombre}.pdf"