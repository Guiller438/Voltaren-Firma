import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Formulario() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [contacto, setContacto] = useState("");
  const firmaRef = useRef();
  const navigate = useNavigate();

  const limpiarFirma = () => {
    firmaRef.current.clear();
  };

  const dividirTexto = (texto, maxLength) => {
    const palabras = texto.split(" ");
    let lineas = [];
    let lineaActual = "";

    palabras.forEach(palabra => {
      if ((lineaActual + palabra).length <= maxLength) {
        lineaActual += palabra + " ";
      } else {
        lineas.push(lineaActual.trim());
        lineaActual = palabra + " ";
      }
    });
    if (lineaActual.length > 0) {
      lineas.push(lineaActual.trim());
    }
    return lineas;
  };

  const generarPDF = async () => {
    if (!nombre || !cedula || !contacto || firmaRef.current.isEmpty()) {
      alert("Por favor completa todos los campos y realiza la firma.");
      return;
    }

    if (contacto.length < 9) {
      alert("Por favor ingresa un número de teléfono válido (mínimo 9 dígitos).");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 850]);
    const { height } = page.getSize();

    const firmaImagen = firmaRef.current.getCanvas().toDataURL("image/png");
    const firmaBytes = await fetch(firmaImagen).then(res => res.arrayBuffer());
    const firmaEmbed = await pdfDoc.embedPng(firmaBytes);

    const logoBytes = await fetch("/voltaren.png").then(res => res.arrayBuffer());
    const logoEmbed = await pdfDoc.embedPng(logoBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const logoWidth = 300;
    const logoHeight = 80;

    page.drawImage(logoEmbed, {
      x: (600 - logoWidth) / 2,
      y: height - 100,
      width: logoWidth,
      height: logoHeight,
    });

    let y = height - 140;

    page.drawText("Liberación de Responsabilidad Voltaren", {
      x: 50,
      y: y,
      size: 14,
      color: rgb(0, 0, 0.7),
      font,
    });

    y -= 30;

    const textoCompleto = [
      `Por la presente, yo, ${nombre}, en pleno uso de mis facultades, declaro que participo voluntariamente en la actividad "La Ruta de las Iglesias" organizada por de TVentas. Entiendo y acepto que mi participación en esta actividad es voluntaria y bajo mi propio riesgo.`,

      `Reconozco que HALEON no es responsable de ningún daño, lesión o efecto adverso que pueda resultar del uso de VOLTAREN durante o después de la actividad. Entiendo que es mi responsabilidad consultar con un profesional de la salud antes de VOLTAREN, especialmente en caso de tener condiciones médicas preexistentes o de estar usando otros medicamentos o productos que pudiesen interferir con el uso de VOLTAREN.`,

      `Al firmar este documento, libero a HALEON, sus empleados, agentes, representantes y afiliados de cualquier responsabilidad por reclamaciones, demandas, daños o acciones legales que puedan surgir en relación con mi participación en la actividad y el uso y aplicación de VOLTAREN.`,

      `Además, el suscrito en pleno uso de mis facultades, otorgo mi consentimiento libre, previo, expreso e informado a Haleon, para que realice el tratamiento de mis datos personales exclusivamente para efectos de llevar el registro de las liberaciones de responsabilidad de los suscritas por los participantes en el marco de la actividad "La Ruta de las Iglesias".`,

      `Para lo cual se entenderá como “Datos Personales Recopilados”:  a) Nombre completo y b) Número de identificación. Haleon se compromete a almacenar los datos personales de manera segura y a implementar las medidas técnicas y organizativas necesarias para protegerlos contra el acceso no autorizado, pérdida o destrucción.`,

      `Como titular de los datos, tengo derecho a acceder, rectificar u oponerme al tratamiento de mis datos personales, conforme a la legislación vigente. Para ejercer estos derechos, puedo comunicarme a través de ${contacto}.`,

      `La autorización para el tratamiento de mis datos personales se mantendrá vigente mientras sea necesario para cumplir con las finalidades mencionadas.`,

      `Confirmo que he leído y comprendido completamente los términos de esta liberación de responsabilidad, que conozco de las precauciones y advertencias del producto, y, que conozco que el producto es clasificado como medicamento. En virtud de lo anterior firmo de manera voluntaria y consciente esta liberación de responsabilidad.`,
    ];

    textoCompleto.forEach(parrafo => {
      const lineas = dividirTexto(parrafo, 90);
      lineas.forEach(linea => {
        page.drawText(linea, { x: 50, y: y, size: 12, font });
        y -= 18;
      });
      y -= 10;
    });

    y -= 20;

    page.drawText(`Nombre: ${nombre}`, { x: 50, y: y, size: 12, font });
    y -= 20;
    page.drawText(`Cédula: ${cedula}`, { x: 50, y: y, size: 12, font });
    y -= 20;

    const fecha = new Date().toLocaleDateString();
    page.drawText(`Fecha: ${fecha}`, { x: 50, y: y, size: 12, font });
    y -= 100;

    page.drawImage(firmaEmbed, {
      x: 200,
      y: y,
      width: 200,
      height: 100,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const formData = new FormData();
    formData.append("cedula", cedula);
    formData.append("nombres", nombre);
    formData.append("contacto", contacto);
    formData.append("file", blob, `Liberacion_Voltaren_${nombre.replace(" ", "_")}.pdf`);

    try {
      const response = await fetch("https://voltaren-firma-back.onrender.com/subir-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/gracias");
      } else {
        alert("Error al subir el documento al servidor.");
        console.error(data);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <div className="App">
      <img src="/voltaren.png" alt="Logo Voltaren" style={{ maxWidth: "250px", marginBottom: "1.5rem" }} />
      <h1>Liberación de Responsabilidad Voltaren</h1>
      <p>Por favor, completa la siguiente información:</p>

      <input
        type="text"
        placeholder="Tu nombre completo"
        value={nombre}
        maxLength={50}
        onChange={(e) => {
          const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
          setNombre(soloLetras);
        }}
      />
      <input
        type="text"
        placeholder="Tu cédula"
        value={cedula}
        onChange={(e) => {
          const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 10);
          setCedula(soloNumeros);
        }}
      />
      <input
        type="text"
        placeholder="Número de Teléfono"
        value={contacto}
        maxLength={10}
        onChange={(e) => {
          const soloNumeros = e.target.value.replace(/\D/g, "");
          setContacto(soloNumeros);
        }}
      />

      <h3>Lee el documento antes de firmar:</h3>
      <div className="documento">
        <p>
          Por la presente, yo, <strong>{nombre || "[Nombre del Participante]"}</strong>, en pleno uso de mis facultades, declaro que participo voluntariamente en la actividad "La Ruta de las Iglesias" organizada por de <strong>TVentas</strong>. Entiendo y acepto que mi participación en esta actividad es voluntaria y bajo mi propio riesgo.
        </p>
        <p>
          Reconozco que HALEON no es responsable de ningún daño, lesión o efecto adverso que pueda resultar del uso de VOLTAREN durante o después de la actividad. Entiendo que es mi responsabilidad consultar con un profesional de la salud antes de VOLTAREN, especialmente en caso de tener condiciones médicas preexistentes o de estar usando otros medicamentos o productos que pudiesen interferir con el uso de VOLTAREN.
        </p>
        <p>
          Al firmar este documento, libero a HALEON, sus empleados, agentes, representantes y afiliados de cualquier responsabilidad por reclamaciones, demandas, daños o acciones legales que puedan surgir en relación con mi participación en la actividad y el uso y aplicación de VOLTAREN.
        </p>
        <p>
          Además, el suscrito en pleno uso de mis facultades, otorgo mi consentimiento libre, previo, expreso e informado a Haleon, para que realice el tratamiento de mis datos personales exclusivamente para efectos de llevar el registro de las liberaciones de responsabilidad de los suscritas por los participantes en el marco de la actividad "La Ruta de las Iglesias".
        </p>
        <p>
          Para lo cual se entenderá como “Datos Personales Recopilados”:  a) Nombre completo y b) Número de identificación. Haleon se compromete a almacenar los datos personales de manera segura y a implementar las medidas técnicas y organizativas necesarias para protegerlos contra el acceso no autorizado, pérdida o destrucción.
        </p>
        <p>
          Como titular de los datos, tengo derecho a acceder, rectificar u oponerme al tratamiento de mis datos personales, conforme a la legislación vigente. Para ejercer estos derechos, puedo comunicarme a través de <strong>{contacto || "[PROPORCIONAR DATOS DE CONTACTO, COMO UN NÚMERO DE TELÉFONO]"}</strong>.
        </p>
        <p>
          La autorización para el tratamiento de mis datos personales se mantendrá vigente mientras sea necesario para cumplir con las finalidades mencionadas.
        </p>
        <p>
          Confirmo que he leído y comprendido completamente los términos de esta liberación de responsabilidad, que conozco de las precauciones y advertencias del producto, y, que conozco que el producto es clasificado como medicamento. En virtud de lo anterior firmo de manera voluntaria y consciente esta liberación de responsabilidad.
        </p>
      </div>

      <h3>Firma aquí:</h3>
      <SignatureCanvas
        penColor="black"
        canvasProps={{ width: 300, height: 150, className: "sigCanvas" }}
        ref={firmaRef}
      />
      <br />
      <button onClick={limpiarFirma}>Limpiar Firma</button>
      <button onClick={generarPDF}>Generar y Enviar PDF</button>
    </div>
  );
}

export default Formulario;
