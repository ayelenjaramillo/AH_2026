
import { useState } from "react";

const LugaresCercanos = ({ onFuncion }) => {
  const [tipo, setTipo] = useState("cafe");

  function onManejadorSubmit(e) {
    e.preventDefault();

    console.log("SE PRESIONÓ BUSCAR");
    console.log("TIPO SELECCIONADO:", tipo);

    onFuncion(tipo);
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

      <div className="mb-5">
        <h2 className="text-lg font-bold text-stone-800">
          Explorá lugares cercanos
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Seleccioná qué tipo de lugar querés encontrar.
        </p>
      </div>

      <form onSubmit={onManejadorSubmit} className="flex flex-col gap-4">

        <div>
          <label
            htmlFor="tipo-lugar"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            ¿Qué estás buscando?
          </label>

          <select
            id="tipo-lugar"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-[#21708C] focus:ring-2 focus:ring-[#21708C]/20"
          >
            <option value="cafe">☕ Cafeterías</option>
            <option value="restaurant">🍽️ Restaurantes</option>
            <option value="pharmacy">💊 Farmacias</option>
            <option value="museum">🏛️ Museos</option>
          </select>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#21708C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19596F] active:scale-[0.98]"
        >
          <span>Buscar lugares</span>
          <span>→</span>
        </button>

      </form>
    </section>
  );
};

export default LugaresCercanos;
