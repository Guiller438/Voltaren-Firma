import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import Layout from "./Layout";

/*
  Paso 3: firma digital y envío al backend.

  El canvas se redimensiona dinámicamente al ancho del contenedor
  para que ocupar el máximo espacio posible en cualquier dispositivo.
  
  Al enviar:
    - Extrae la firma como base64 PNG
    - Manda FormData con todos los datos al endpoint /api/registro
    - Maneja errores del servidor (cédula duplicada, inválida, etc.)
      mostrándolos en pantalla sin alert()
*/
export default function PanelFirma({ datos, onVolver }) {
  const firmaRef   = useRef(null);
  const contenedorRef = useRef(null);
  const navigate   = useNavigate();

  const [canvasAncho, setCanvasAncho]  = useState(320);
  const [enviando, setEnviando]        = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  /* Ajustar el ancho del canvas al contenedor real */
  useEffect(() => {
    const ajustar = () => {
      if (contenedorRef.current) {
        setCanvasAncho(contenedorRef.current.offsetWidth);
      }
    };
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);

  const limpiar = () => {
    firmaRef.current?.clear();
    setErrorServidor("");
  };

  const enviar = async () => {
    /* Validar que haya firma */
    if (!firmaRef.current || firmaRef.current.isEmpty()) {
      setErrorServidor("Por favor dibuja tu firma antes de continuar.");
      return;
    }

    setEnviando(true);
    setErrorServidor("");

    /* Obtener firma como base64 PNG */
    const firmaBase64 = firmaRef.current
      .getCanvas()
      .toDataURL("image/png");

    /* Construir FormData */
    const form = new FormData();
    form.append("nombres",  datos.nombres);
    form.append("cedula",   datos.cedula);
    form.append("contacto", datos.contacto);
    form.append("firma",    firmaBase64);

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (res.ok) {
        navigate("/gracias");
      } else {
        /* El backend devuelve { detail: "..." } en los errores HTTP */
        setErrorServidor(json.detail || "Ocurrió un error. Intenta de nuevo.");
      }
    } catch {
      setErrorServidor("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Layout paso={3}>
      <h2 style={s.titulo}>Tu firma</h2>
      <p style={s.desc}>
        Firma dentro del recuadro con tu dedo. Intenta que sea similar a tu firma habitual.
      </p>

      {/* Canvas de firma */}
      <div ref={contenedorRef} style={s.canvasWrap}>
        <SignatureCanvas
          ref={firmaRef}
          penColor="#1A1A1A"
          backgroundColor="rgba(255,255,255,1)"
          canvasProps={{
            width:  canvasAncho,
            height: Math.round(canvasAncho * 0.4),   /* proporción 5:2 */
            style: { display: "block", touchAction: "none" },
          }}
        />
        <span style={s.canvasHint}>✍ Firma aquí</span>
      </div>

      {/* Error del servidor */}
      {errorServidor && (
        <div style={s.errorBox}>
          <span style={s.errorIcono}>⚠</span> {errorServidor}
        </div>
      )}

      {/* Resumen de datos */}
      <div style={s.resumen}>
        <ResumenFila label="Nombre"   valor={datos.nombres} />
        <ResumenFila label="Cédula"   valor={datos.cedula} />
        <ResumenFila label="Teléfono" valor={datos.contacto} />
      </div>

      {/* Botones */}
      <button style={s.btnLimpiar} onClick={limpiar} disabled={enviando}>
        Limpiar firma
      </button>

      <div style={s.botones}>
        <button style={s.btnVolver} onClick={onVolver} disabled={enviando}>
          ← Volver
        </button>
        <button
          style={{ ...s.btnEnviar, ...(enviando ? s.btnEnviando : {}) }}
          onClick={enviar}
          disabled={enviando}
        >
          {enviando ? "Enviando…" : "Confirmar y enviar"}
        </button>
      </div>
    </Layout>
  );
}

function ResumenFila({ label, valor }) {
  return (
    <div style={sf.fila}>
      <span style={sf.label}>{label}</span>
      <span style={sf.valor}>{valor}</span>
    </div>
  );
}

const s = {
  titulo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "var(--azul)",
    marginBottom: "6px",
  },
  desc: {
    fontSize: "14px",
    color: "var(--texto-suave)",
    marginBottom: "14px",
    lineHeight: "1.5",
  },
  canvasWrap: {
    position: "relative",
    border: "2px dashed var(--naranja)",
    borderRadius: "var(--radio-sm)",
    overflow: "hidden",
    background: "white",
    marginBottom: "12px",
  },
  canvasHint: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "14px",
    color: "#CCCCCC",
    pointerEvents: "none",
    userSelect: "none",
  },
  errorBox: {
    background: "#FFF5F5",
    border: "1px solid #FFCCCC",
    borderRadius: "var(--radio-sm)",
    padding: "12px 14px",
    fontSize: "13px",
    color: "var(--error)",
    marginBottom: "12px",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  errorIcono: { fontSize: "16px", flexShrink: 0 },
  resumen: {
    background: "var(--gris-claro)",
    borderRadius: "var(--radio-sm)",
    padding: "12px 14px",
    marginBottom: "14px",
  },
  btnLimpiar: {
    width: "100%",
    padding: "11px",
    background: "transparent",
    border: "1.5px solid var(--gris-borde)",
    borderRadius: "var(--radio-sm)",
    fontSize: "14px",
    color: "var(--texto-suave)",
    cursor: "pointer",
    marginBottom: "10px",
  },
  botones: {
    display: "flex",
    gap: "10px",
  },
  btnVolver: {
    flex: "0 0 auto",
    padding: "14px 18px",
    background: "transparent",
    border: "1.5px solid var(--gris-borde)",
    borderRadius: "var(--radio-sm)",
    fontSize: "15px",
    color: "var(--texto-suave)",
    cursor: "pointer",
  },
  btnEnviar: {
    flex: 1,
    padding: "14px",
    background: "var(--naranja)",
    color: "white",
    border: "none",
    borderRadius: "var(--radio-sm)",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnEnviando: {
    background: "var(--gris-borde)",
    color: "var(--texto-suave)",
    cursor: "not-allowed",
  },
};

const sf = {
  fila: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
    fontSize: "13px",
  },
  label: { color: "var(--texto-suave)", fontWeight: "500" },
  valor: { color: "var(--texto)", fontWeight: "600" },
};
