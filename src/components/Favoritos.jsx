import { useEffect, useState } from "react";

import {
  obtenerFavoritos,
  actualizarNotaFavorito,
  eliminarFavorito,
} from "../servicios/ServicioFav";

const Favoritos = ({ usuario }) => {
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [notas, setNotas] = useState({});

  useEffect(() => {
    async function cargarFavoritos() {
      try {
        setCargando(true);
        setError("");

        const datos = await obtenerFavoritos(usuario);

        setFavoritos(datos);

        const notasGuardadas = {};

        datos.forEach((favorito) => {
          notasGuardadas[favorito.id] = favorito.nota || "";
        });

        setNotas(notasGuardadas);
      } catch (error) {
        console.error("Error al consultar favoritos:", error);
        setError("No se pudieron cargar los favoritos.");
      } finally {
        setCargando(false);
      }
    }

    if (usuario) {
      cargarFavoritos();
    }
  }, [usuario]);

  function manejarCambioNota(id, valor) {
    setNotas({
      ...notas,
      [id]: valor,
    });
  }

  async function manejarGuardarNota(id) {
    try {
      setError("");
      setMensaje("");

      await actualizarNotaFavorito(id, notas[id] || "");

      setMensaje("Nota guardada correctamente.");
    } catch (error) {
      console.error("Error al actualizar la nota:", error);
      setError("No se pudo guardar la nota.");
    }
  }

  async function manejarEliminar(id) {
    try {
      setError("");
      setMensaje("");

      await eliminarFavorito(id);

      setFavoritos(favoritos.filter((favorito) => favorito.id !== id));

      setMensaje("Lugar eliminado de favoritos.");
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      setError("No se pudo eliminar el favorito.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#21708C]">
          Tu colección personal
        </span>

        <h1 className="mt-2 text-2xl font-bold text-stone-800">
          Mis favoritos
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Guardá tus lugares preferidos y agregales tus propias notas.
        </p>
      </div>

      {cargando && <p className="text-stone-500">Cargando favoritos...</p>}

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {mensaje && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {mensaje}
        </p>
      )}

      {!cargando && !error && favoritos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
          <p className="font-medium text-stone-700">
            Todavía no guardaste lugares favoritos.
          </p>

          <p className="mt-2 text-sm text-stone-500">
            Explorá el mapa y guardá los lugares que te interesen.
          </p>
        </div>
      )}

      {!cargando && !error && favoritos.length > 0 && (
        <section className="grid gap-5 sm:grid-cols-2">
          {favoritos.map((favorito) => (
            <article
              key={favorito.id}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-stone-800">
                  {favorito.nombre}
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  {favorito.direccion}
                </p>

                {favorito.categoria && (
                  <span className="mt-3 inline-block rounded-full bg-[#21708C]/10 px-3 py-1 text-xs font-medium text-[#21708C]">
                    {favorito.categoria}
                  </span>
                )}

                {favorito.url && (
                  <div>
                    <a
                      href={favorito.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-[#21708C] underline"
                    >
                      Ver en Google Maps →
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-2 border-t border-stone-100 pt-4">
                <label
                  htmlFor={`nota-${favorito.id}`}
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  Mi nota personal
                </label>

                <textarea
                  id={`nota-${favorito.id}`}
                  value={notas[favorito.id] || ""}
                  onChange={(e) =>
                    manejarCambioNota(favorito.id, e.target.value)
                  }
                  placeholder="Escribí algo sobre este lugar..."
                  rows="3"
                  className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700 outline-none transition focus:border-[#21708C] focus:ring-2 focus:ring-[#21708C]/20"
                />

                <button
                  type="button"
                  onClick={() => manejarGuardarNota(favorito.id)}
                  className="mt-3 w-full rounded-xl bg-[#21708C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#19596F]"
                >
                  Guardar nota
                </button>
              </div>

              <button
                type="button"
                onClick={() => manejarEliminar(favorito.id)}
                className="mt-3 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Eliminar de favoritos
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default Favoritos;
