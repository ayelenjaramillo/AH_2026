
import { useEffect, useState } from "react";

const Clima = ({ origen }) => {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!origen) {
      setClima(null);
      return;
    }

    async function consultarClima() {
      setCargando(true);
      setError("");

      try {
        const respuesta = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${origen.lat}&longitude=${origen.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&timezone=auto`
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo consultar el clima");
        }

        const datos = await respuesta.json();

        setClima(datos.current);

      } catch (error) {
        console.error("Error al consultar el clima:", error);
        setError("No se pudo obtener la información meteorológica");
      } finally {
        setCargando(false);
      }
    }

    consultarClima();

  }, [origen]);

  function obtenerEstadoClima(codigo) {
    if (codigo === 0) return "Despejado";
    if ([1, 2].includes(codigo)) return "Parcialmente nublado";
    if (codigo === 3) return "Nublado";
    if ([45, 48].includes(codigo)) return "Niebla";
    if ([51, 53, 55, 56, 57].includes(codigo)) return "Llovizna";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return "Lluvia";
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return "Nieve";
    if ([95, 96, 99].includes(codigo)) return "Tormenta";

    return "Estado no disponible";
  }

  if (!origen) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Detectá tu ubicación para consultar el clima.
        </p>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        Consultando el clima...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-5 text-sm text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (!clima) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <h3 className="mb-4 font-semibold text-slate-800">
        Clima en tu ubicación
      </h3>

      <div className="mb-5">
        <p className="text-4xl font-bold text-[#21708C]">
          {Math.round(clima.temperature_2m)} °C
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {obtenerEstadoClima(clima.weather_code)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Sensación térmica</p>
          <p className="mt-1 font-semibold">
            {Math.round(clima.apparent_temperature)} °C
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Humedad</p>
          <p className="mt-1 font-semibold">
            {clima.relative_humidity_2m} %
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Viento</p>
          <p className="mt-1 font-semibold">
            {clima.wind_speed_10m} km/h
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Precipitaciones</p>
          <p className="mt-1 font-semibold">
            {clima.precipitation} mm
          </p>
        </div>

      </div>

    </section>
  );
};

export default Clima;
