import { useRef, useEffect, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

setOptions({
  key: "AIzaSyBFaUdKM_pQWOAq63b4RtybheeF0MVXCUg",
  v: "weekly",
});

const Mapa = ({ marcadores, origen }) => {
  const trelew = {
    lat: -43.24895,
    lng: -65.30505,
  };

  const mapaRef = useRef(null);
  const googleMap = useRef(null);
  const marcadorRef = useRef([]);

  const [mapaListo, setMapaListo] = useState(false);

  useEffect(() => {
    async function iniciarMapa() {
      try {
        const { Map } = await importLibrary("maps");

        googleMap.current = new Map(mapaRef.current, {
          center: origen || trelew,
          zoom: 13,
          mapId: "DEMO_MAP_ID",
        });

        setMapaListo(true);
      } catch (error) {
        console.error(error);
      }
    }
    iniciarMapa();
  }, []);

  useEffect(() => {
    if (mapaListo == false || !googleMap.current) {
      return;
    }

    // Actualizamos el centro cuando cambia el origen
    if (origen) {
      googleMap.current.setCenter({
        lat: origen.lat,
        lng: origen.lng,
      });
    }

    async function actualizarMarcadores() {
      try {
        const { AdvancedMarkerElement } = await importLibrary("marker");

        marcadorRef.current.forEach((m) => {
          m.map = null;
        });

        marcadorRef.current = [];

        // MARCADOR DE MI UBICACIÓN
        if (origen) {
          const marcadorOrigen = new AdvancedMarkerElement({
            map: googleMap.current,
            position: {
              lat: Number(origen.lat),
              lng: Number(origen.lng),
            },
            title: "Mi ubicación actual",
          });
        
          marcadorRef.current.push(marcadorOrigen);
        }
        
        // MARCADORES DE LOS LUGARES ENCONTRADOS
        marcadores.forEach((marcador) => {
          const nuevo_marcador = new AdvancedMarkerElement({
            map: googleMap.current,
            position: {
              lat: Number(marcador.lat),
              lng: Number(marcador.lng),
            },
            title: marcador.nombre,
          });
        
          marcadorRef.current.push(nuevo_marcador);
        });
      } catch (error) {
        console.error(error);
      }
    }

    actualizarMarcadores();
  }, [marcadores, mapaListo, origen]);

  return (
    <>
      <div ref={mapaRef} style={{ width: "100%", height: "500px" }}></div>
    </>
  );
};

export default Mapa;
