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
    <section>
      <h2>Buscar destino por nombre</h2>
      <div ref={contenedorRef} className="contenedor-autocomplete"></div>
    </section>
  );
};

export default BuscadorDestino;
