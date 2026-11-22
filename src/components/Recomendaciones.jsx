import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect } from "react";

function Recomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarRecomendaciones() {
      console.log("Iniciando consulta a Firebase...");

      try {
        const respuesta = await getDocs(collection(db, "recomendaciones"));

        console.log("Respuesta de Firebase:", respuesta);

        const datos = respuesta.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        console.log("Recomendaciones obtenidas:", datos);

        setRecomendaciones(datos);
      } catch (error) {
        console.error("Error al consultar Firebase:", error);
        setError("No se pudieron cargar las recomendaciones");
      } finally {
        console.log("Finalizó la consulta");
        setCargando(false);
      }
    }

    cargarRecomendaciones();
  }, []);

  return (
    <section className="rounded-2xl bg-stone-50 px-5 py-8 sm:px-8">
      <div className="mb-7">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#21708C]">
          Explora recomienda
        </span>

        <h2 className="mt-2 text-2xl font-bold text-stone-800">
          Recomendaciones by Aye
        </h2>

        <p className="mt-2 text-sm text-stone-500">
          Descubrí lugares que vale la pena conocer.
        </p>
      </div>

      {cargando && (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-stone-500">
          Cargando recomendaciones...
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {!cargando && !error && recomendaciones.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="font-medium text-stone-700">
            Todavía no hay recomendaciones.
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Pronto vas a encontrar nuevos lugares para descubrir.
          </p>
        </div>
      )}

      {!cargando && !error && recomendaciones.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recomendaciones.map((r) => (
            <article
              key={r.id}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-[#21708C]/10 px-3 py-1 text-xs font-semibold text-[#21708C]">
                  {r.categoria}
                </span>

                <span className="text-xl">✦</span>
              </div>

              <h3 className="text-lg font-bold text-stone-800 transition group-hover:text-[#21708C]">
                {r.titulo}
              </h3>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
                {r.descripcion}
              </p>

              <div className="mt-5 border-t border-stone-100 pt-3">
                <span className="text-xs font-medium text-stone-400">
                  Una recomendación de Explora
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Recomendaciones;
