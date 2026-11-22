import { useEffect, useRef } from "react";
import { importLibrary } from "@googlemaps/js-api-loader";

const BuscadorDestino = ({ onElegirDestino, onError }) => {
  const contenedorRef = useRef(null);
  const elegirRef = useRef(onElegirDestino);
  const errorRef = useRef(onError);

  useEffect(() => {
    elegirRef.current = onElegirDestino;
    errorRef.current = onError;
  }, [onElegirDestino, onError]);

  useEffect(() => {
    let cancelado = false;
    let autocomplete = null;
    let manejarSeleccion = null;

    async function iniciarAutocomplete() {
      try {
        const { PlaceAutocompleteElement } = await importLibrary("places");
        if (cancelado || !contenedorRef.current) return;

        autocomplete = new PlaceAutocompleteElement();
        autocomplete.placeholder = "Ej: Restaurant, Trelew";

        manejarSeleccion = async ({ placePrediction }) => {
          try {
            const place = placePrediction.toPlace();
            await place.fetchFields({
              fields: [
                "id",
                "displayName",
                "formattedAddress",
                "location",
                "primaryTypeDisplayName",
                "businessStatus",
                "googleMapsURI",
              ],
            });

            if (cancelado) return;
            if (!place.location) {
              throw new Error("el lugar no tiene coordenadas");
            }

            const lugarElegido = {
              id: place.id,
              nombre: place.displayName || "Sin nombre",
              direccion: place.formattedAddress || "Dirección no disponible",
              categoria: place.primaryTypeDisplayName || "Sin categoría",
              estado: place.businessStatus || "No disponible",
              url: place.googleMapsURI,
              lat: place.location.lat(),
              lng: place.location.lng(),
            };

            elegirRef.current(lugarElegido);
            errorRef.current("");
          } catch (error) {
            console.error("error al seleccionar destino:", error);
            errorRef.current("No se pudo obtener el lugar seleccionado");
          }
        };
        autocomplete.addEventListener("gmp-select", manejarSeleccion);
        contenedorRef.current.appendChild(autocomplete);
      } catch (error) {
        console.error("Error al iniciar autocomplete:", error);

        if (!cancelado) {
          errorRef.current("No se púdo caargar el buscador de destinos");
        }
      }
    }

    iniciarAutocomplete();
    return () => {
      cancelado = true;
      if (autocomplete) {
        autocomplete.removeEventListener("gmp-select", manejarSeleccion);
        autocomplete.remove();
      }
    };
  }, []);

 
return (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-[#21708C]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z"
            />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        <h2 className="font-semibold text-slate-800">
          Buscar un destino
        </h2>
      </div>

      <p className="text-sm text-slate-500">
        Encontrá una dirección o un lugar por su nombre.
      </p>
    </div>

    <div
      ref={contenedorRef}
      className="buscador-autocomplete w-full"
    />

    <p className="mt-3 text-xs text-slate-400">
      Por ejemplo: cafeterías, restaurantes o una dirección.
    </p>

  </section>
);

};

export default BuscadorDestino;
