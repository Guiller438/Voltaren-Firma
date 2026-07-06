import { useRef, useState, useEffect } from "react";
import Layout from "./Layout";

/*
  Paso 2: el participante lee el documento completo.
  El botón "Acepto y firmo" se habilita solo cuando llega al final del scroll,
  lo que garantiza que vio todo el texto.
*/
export default function Terminos({ nombre, onVolver, onSiguiente }) {
  const scrollRef = useRef(null);
  const [leido, setLeido] = useState(false);

  /* Detectar si el usuario llegó al final */
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const alFinal = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (alFinal) setLeido(true);
  };

  /* En pantallas donde el contenido no requiere scroll, habilitar igual */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight) setLeido(true);
  }, []);

  const nombreMostrado = nombre.trim() || "[Nombre del Participante]";

  return (
    <Layout paso={2}>
      <h2 style={s.titulo}>Documento de liberación</h2>
      <p style={s.desc}>
        Lee el documento completo. El botón se habilitará al llegar al final.
      </p>

      <div ref={scrollRef} onScroll={onScroll} style={s.scroll}>
        <p style={s.parrafo}>
          Por la presente, yo, <strong>{nombreMostrado}</strong>, en pleno uso de mis
          facultades, declaro que participo voluntariamente en la actividad "La Ruta de
          las Iglesias" organizada por <strong>TVENTAS</strong>. Entiendo y acepto que mi
          participación en esta actividad es voluntaria y bajo mi propio riesgo.
        </p>
        <p style={s.parrafo}>
          Reconozco que <strong>HALEON</strong> no es responsable de ningún daño, lesión
          o efecto adverso que pueda resultar del uso de VOLTAREN durante o después de la
          actividad. Entiendo que es mi responsabilidad consultar con un profesional de la
          salud antes de VOLTAREN, especialmente en caso de tener condiciones médicas
          preexistentes o de estar usando otros medicamentos o productos que pudiesen
          interferir con el uso de VOLTAREN.
        </p>
        <p style={s.parrafo}>
          Al firmar este documento, libero a <strong>HALEON</strong>, sus empleados,
          agentes, representantes y afiliados de cualquier responsabilidad por
          reclamaciones, demandas, daños o acciones legales que puedan surgir en relación
          con mi participación en la actividad y el uso y aplicación de VOLTAREN.
        </p>
        <p style={s.parrafo}>
          Además, el suscrito en pleno uso de mis facultades, otorgo mi consentimiento
          libre, previo, expreso e informado a Haleon, para que realice el tratamiento de
          mis datos personales exclusivamente para efectos de llevar el registro de las
          liberaciones de responsabilidad de los suscritas por los participantes en el
          marco de la actividad "La Ruta de las Iglesias".
        </p>
        <p style={s.parrafo}>
          Para lo cual se entenderá como "<strong>Datos Personales Recopilados</strong>":
          a) Nombre completo y b) Número de identificación c) correo electrónico. Haleon
          se compromete a almacenar los datos personales de manera segura y a implementar
          las medidas técnicas y organizativas necesarias para protegerlos contra el
          acceso no autorizado, pérdida o destrucción.
        </p>
        <p style={s.parrafo}>
          Como titular de los datos, tengo derecho a acceder, rectificar u oponerme al
          tratamiento de mis datos personales, conforme a la legislación vigente. Para
          ejercer estos derechos, puedo comunicarme a través de{" "}
          <strong>haleon.ecuador@haleon.com</strong>.
        </p>
        <p style={s.parrafo}>
          La autorización para el tratamiento de mis datos personales se mantendrá
          vigente mientras sea necesario para cumplir con las finalidades mencionadas.
        </p>
        <p style={s.parrafo}>
          Confirmo que he leído y comprendido completamente los términos de esta
          liberación de responsabilidad, que conozco de las precauciones y advertencias
          del producto, y, que conozco que el producto es clasificado como medicamento.
          En virtud de lo anterior firmo de manera voluntaria y consciente esta
          liberación de responsabilidad.
        </p>

        {!leido && (
          <p style={s.hint}>↓ Sigue leyendo para continuar</p>
        )}
      </div>

      <div style={s.botones}>
        <button style={s.btnVolver} onClick={onVolver}>
          ← Volver
        </button>
        <button
          style={{ ...s.btnAceptar, ...(leido ? {} : s.btnDeshabilitado) }}
          onClick={leido ? onSiguiente : undefined}
          disabled={!leido}
        >
          Acepto y firmo →
        </button>
      </div>
    </Layout>
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
    fontSize: "13px",
    color: "var(--texto-suave)",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  scroll: {
    maxHeight: "42vh",
    overflowY: "auto",
    border: "1.5px solid var(--gris-borde)",
    borderRadius: "var(--radio-sm)",
    padding: "16px",
    background: "#FAFAFA",
    WebkitOverflowScrolling: "touch",   /* scroll suave en iOS */
  },
  parrafo: {
    fontSize: "13px",
    lineHeight: "1.7",
    color: "var(--texto)",
    textAlign: "justify",
    marginBottom: "12px",
  },
  hint: {
    textAlign: "center",
    fontSize: "12px",
    color: "var(--naranja)",
    fontWeight: "600",
    padding: "8px 0 4px",
  },
  botones: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
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
  btnAceptar: {
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
  btnDeshabilitado: {
    background: "var(--gris-borde)",
    color: "var(--texto-suave)",
    cursor: "not-allowed",
  },
};
