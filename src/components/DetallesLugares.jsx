
const Detalle = ({ marcadores, onVerDetalle }) => {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-800">
            Lugares encontrados
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Explorá los lugares disponibles
          </p>
        </div>

        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-600">
          {marcadores.length} resultados
        </span>
      </div>

      {marcadores.length === 0 ? (
        <p className="rounded-xl bg-stone-50 p-5 text-center text-sm text-stone-500">
          No se encontraron lugares.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {marcadores.map((m) => (
            <li
              key={m.id}
              className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50/60 p-4 transition hover:border-stone-300 hover:bg-white hover:shadow-md"
            >
              <div>
                <h3 className="font-semibold text-stone-800 transition group-hover:text-[#21708C]">
                  {m.nombre}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-stone-500">
                  {m.direccion}
                </p>

                {m.categoria && (
                  <span className="mt-3 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    {m.categoria}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onVerDetalle(m.id)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#21708C]"
              >
                Ver detalle
                <span>→</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Detalle;
