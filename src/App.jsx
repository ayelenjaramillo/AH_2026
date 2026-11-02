import { useEffect, useRef, useState } from "react";
// import Escuela from "./components/Escuelas";
// import FormDireccion from "./components/FormDireccion";
import Mapa from "./components/Mapa";
import LugaresCercanos from "./components/LugaresCercanos";
import DetallesLugares from "./components/DetallesLugares";

import { importLibrary } from "@googlemaps/js-api-loader";
import BuscadorDestino from "./components/BuscadorDestino";

function App() {
  const [origen, setOrigen] = useState(null);
  const [ruta, setRuta] = useState(null);

  const [ubicando, setUbicando] = useState(false);
  const [cargandoRuta, setCargandoRuta] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const [errorUbicacion, setErrorUbicacion] = useState("");
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [errorRuta, setErrorRuta] = useState("");

  const [cargando, setCargando] = useState(false);
  const [detalle, setDetalle] = useState(null);

  const [marcadores, setMarcadores] = useState([]);

  const busquedaActualUsuario = useRef(0);

  // Detectar ubicación del usuario
  function detectarUbicacion() {
    if (!navigator.geolocation) {
      setErrorUbicacion("El navegador no admite geolocalización");
      return;
    }

    setUbicando(true);
    setErrorUbicacion("");

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const miUbicacion = {
          nombre: "Mi ubicación actual",
          lat: posicion.coords.latitude,
          lng: posicion.coords.longitude,
        };

        setOrigen(miUbicacion);
        setRuta(null);
        setErrorRuta("");

        busquedaActualUsuario.current += 1;
        setMarcadores([]);
        setDetalle(null);
        setBusquedaRealizada(false);
        setCargando(false);
        setUbicando(false);
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        setErrorUbicacion(
          "No se pudo acceder a la ubicación. Revisá los permisos"
        );
        setUbicando(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  // Seleccionar un lugar
  function seleccionarDetalle(lugar) {
    setDetalle(lugar);
    setRuta(null);
    setErrorRuta("");
  }

  function elegirDesdeAutocomplete(lugar) {
    busquedaActualUsuario.current += 1;
  
    setCargando(false);
    setMarcadores([lugar]);
    setBusquedaRealizada(false);
    setErrorBusqueda("");
  
    seleccionarDetalle(lugar);
  }
  async function buscarLugaresCercanos(tipo) {
    console.log("BUSCANDO LUGARES:", tipo);
  console.log("ORIGEN:", origen);
    if (!origen) {
      setErrorBusqueda("Autoriza tu ubicación para buscar lugares cercanos");
      return;
    }
  
    if (cargando) return;
  
    const numeroBusqueda = ++busquedaActualUsuario.current;
  
    setCargando(true);
    setBusquedaRealizada(true);
    setErrorBusqueda("");
    setMarcadores([]);
    setDetalle(null);
    setRuta(null);
    setCargandoRuta(false);
    setErrorRuta("");
  
    try {
      const { Place } = await importLibrary("places");
  
      const solicitud = {
        fields: [
          "id",
          "displayName",
          "location",
          "formattedAddress",
          "primaryTypeDisplayName",
          "businessStatus",
          "googleMapsURI",
        ],
        locationRestriction: {
          center: {
            lat: origen.lat,
            lng: origen.lng,
          },
          radius: 2000,
        },
        includedPrimaryTypes: [tipo],
        maxResultCount: 8,
      };
  
      const { places } = await Place.searchNearby(solicitud);
  
      console.log("1. Lugares encontrados:", places);
      console.log("2. Cantidad de lugares:", places?.length);
  
      if (numeroBusqueda !== busquedaActualUsuario.current) return;
  
      const nuevo = (places || [])
        .filter((place) => place.location)
        .map((place) => ({
          id: place.id,
          nombre: place.displayName || "Sin nombre",
          direccion: place.formattedAddress || "Sin dirección disponible",
          categoria: place.primaryTypeDisplayName || "Sin categoría",
          estado: place.businessStatus || "Dato no disponible",
          url: place.googleMapsURI,
          lat: place.location.lat(),
          lng: place.location.lng(),
        }));
  
      console.log("3. Marcadores preparados:", nuevo);
  
      setMarcadores(nuevo);
  
    } catch (error) {
      console.error("Error en Nearby Search:", error);
  
      if (numeroBusqueda === busquedaActualUsuario.current) {
        setErrorBusqueda("No se cargaron lugares cercanos");
      }
  
    } finally {
      if (numeroBusqueda === busquedaActualUsuario.current) {
        setCargando(false);
      }
    }
  }

  // Consultar detalle del lugar seleccionado
  function consultarLugares(id) {
    const lugarSelec = marcadores.find((lugar) => lugar.id === id);

    if (!lugarSelec) return;

    seleccionarDetalle(lugarSelec);
  }

  // Calcular ruta entre el origen y el destino
  useEffect(() => {
    if (!origen || !detalle) return;

    let cancelado = false;

    async function calcularRuta() {
      setCargandoRuta(true);
      setRuta(null);
      setErrorRuta("");

      try {
        const { Route } = await importLibrary("routes");

        const { routes } = await Route.computeRoutes({
          origin: {
            lat: origen.lat,
            lng: origen.lng,
          },
          destination: {
            lat: detalle.lat,
            lng: detalle.lng,
          },
          travelMode: "WALKING",
          fields: ["path", "distanceMeters", "durationMillis"],
        });

        if (cancelado) return;

        const rutaCalculada = routes?.[0];

        if (
          !rutaCalculada ||
          rutaCalculada.distanceMeters == null ||
          rutaCalculada.durationMillis == null
        ) {
          throw new Error("No se encontró una ruta a pie");
        }

        setRuta(rutaCalculada);
      } catch (error) {
        if (cancelado) return;

        console.error("Error en Routes:", error);
        setErrorRuta("No se encontró una ruta a pie");
      } finally {
        if (!cancelado) {
          setCargandoRuta(false);
        }
      }
    }

    calcularRuta();

    return () => {
      cancelado = true;
    };
  }, [origen, detalle]);

  // Calcular distancia y duración
  const distanciaKm =
    ruta?.distanceMeters != null
      ? (ruta.distanceMeters / 1000).toFixed(1)
      : null;

  const duracionMinutos =
    ruta?.durationMillis != null
      ? Math.round(ruta.durationMillis / 60000)
      : null;

  // Agregar un marcador manualmente
  // function agregarMarcadorAMapa(nuevoMarcador) {
  //   setMarcadores([...marcadores, nuevoMarcador]);
  // }
  return (
    <>
      <h1>AH</h1>
      <section>
        <h2> Mi punto de partida: </h2>
        <button type="button" onClick={detectarUbicacion} disabled={ubicando}>
          {ubicando ? "obteniendo ubicacion" : "Detectar mi ubicacion"}
        </button>
        <p>{origen ? "Ubi autorizada" : "Ubi no autorizada"}</p>
        {errorUbicacion && <p role="alert">{errorUbicacion}</p>}
      </section>

      <BuscadorDestino
        onElegirDestino={elegirDesdeAutocomplete}
        onError={setErrorBusqueda}
      />

      <LugaresCercanos
        onFuncion={buscarLugaresCercanos}
        cargando={cargando}
        deshabilitado={!origen || cargando || ubicando}
      />

      {!origen && <p>Autoriza tu ubi para buscar y calcular distancias</p>}
      {errorBusqueda && <p role="alert">{errorBusqueda}</p>}

      {/* <FormDireccion agregarMarcadorAMapa={agregarMarcadorAMapa} /> */}
      <Mapa
        marcadores={marcadores}
        origen={origen}
        destino={detalle}
        ruta={ruta}
      />
      {detalle && (
        <section>
          <h2>Detalle del lugar</h2>
          <h3>{detalle.nombre}</h3>
          <p>Dirección: {detalle.direccion}</p>
          {detalle.categoria && <p>Categoría: {detalle.categoria}</p>}
          {detalle.estado && (
            <p>
              Estado:{" "}
              {detalle.estado === "OPERATIONAL" ? "Operativo" : detalle.estado}
            </p>
          )}
          {!origen && <p>Detectá tu ubicación para calcular el recorrido.</p>}
          {cargandoRuta && <p>Calculando recorrido a pie...</p>}
          {distanciaKm != null && (
            <div>
              <p>Distancia a pie: {distanciaKm} km</p>
              <p>Tiempo estimado: {duracionMinutos} minutos</p>
            </div>
          )}
          {errorRuta && <p role="alert">{errorRuta}</p>}
        </section>
      )}

      {cargando ? (
        <p>Buscando...</p>
      ) : (
        busquedaRealizada && (
          <DetallesLugares
            marcadores={marcadores}
            onVerDetalle={consultarLugares}
            cargandoDetalle={cargandoRuta}
          />
        )
      )}

  {/*     <Escuela /> */}
    </>
  );
}

export default App;
