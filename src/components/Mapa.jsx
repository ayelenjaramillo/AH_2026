import { useRef, useEffect, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

setOptions({
  key: "AIzaSyBFaUdKM_pQWOAq63b4RtybheeF0MVXCUg",
  v: "weekly",
});

const Mapa = ({ marcadores }) => {
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
          center: trelew,
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

    async function actualizarMarcadores() {
      try {
        const { AdvancedMarkerElement } = await importLibrary("marker");
        marcadorRef.current.forEach((m) => {
          m.map = null;
        });

marcadores.forEach((marcador)=>{
  let nuevo_marcador = new AdvancedMarkerElement({
    map: googleMap.current,
    position: {
      lat:marcador.lat, 
      lng: marcador.lng
    },
    title: marcador.nombre
  })

  marcadorRef.current.push(nuevo_marcador)
})

      } catch (error) {
        console.error(error);
      }
    }
    actualizarMarcadores()
  }, [marcadores, mapaListo]);

  return (
    <>
      <div ref={mapaRef} style={{ width: "100%", height: "500px" }}></div>
    </>
  );
};

export default Mapa;
