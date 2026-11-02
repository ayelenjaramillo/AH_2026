import { collection, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect } from "react";

function Recomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarRecomendaciones() {
      try {
        const respuesta = await getDocs(collection(db, "recomendaciones"));
        const datos = respuesta.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));
        setRecomendaciones(datos);
      } catch (error) {
        console.error(error);
        setError("Error");
      } finally {
        setCargando(false);
      }
    }
  });
}

export default Recomendaciones;
