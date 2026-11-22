import { useEffect, useRef, useState } from "react";
import Mapa from "./components/Mapa";
import LugaresCercanos from "./components/LugaresCercanos";
import DetallesLugares from "./components/DetallesLugares";
import Clima from "./components/Clima";
import { importLibrary } from "@googlemaps/js-api-loader";
import BuscadorDestino from "./components/BuscadorDestino";
import Recomendaciones from "./components/Recomendaciones";
import Autenticacion from "./components/Autenticacion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Favoritos from "./components/Favoritos";
import { Routes, Route, NavLink, Navigate } from "react-router";
import RutaProtegida from "./components/RutaProtegida";
import { guardarFavorito } from "./servicios/ServicioFav";

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

  const [usuario, setUsuario] = useState(null);
  const [comprobarSesion, setComprobarSesion] = useState(true);

  const busquedaActualUsuario = useRef(0);

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
          "No se pudo acceder a la ubicación. Revisá los permisos",
        );
        setUbicando(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

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

  function consultarLugares(id) {
    const lugarSelec = marcadores.find((lugar) => lugar.id === id);

    if (!lugarSelec) return;

    seleccionarDetalle(lugarSelec);
  }
  async function manejarGuardarFavorito() {
    if (!usuario || !detalle) return;

    try {
      const resultado = await guardarFavorito(usuario, detalle);

      console.log(resultado.mensaje);
    } catch (error) {
      console.error("Error al guardar favorito:", error);
    }
  }

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

  const distanciaKm =
    ruta?.distanceMeters != null
      ? (ruta.distanceMeters / 1000).toFixed(1)
      : null;

  const duracionMinutos =
    ruta?.durationMillis != null
      ? Math.round(ruta.durationMillis / 60000)
      : null;

  useEffect(() => {
    const cancelarEstado = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual);
      setComprobarSesion(false);
    });

    return () => cancelarEstado();
  }, []);

  return (
    <>
      <nav className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <NavLink
            to="/"
            className="text-lg font-bold tracking-tight text-stone-800"
          >
            Explora<span className="text-[#A3A39A]">.</span>
          </NavLink>

          <div className="flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-stone-100 text-stone-800"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                }`
              }
            >
              Inicio
            </NavLink>

            <NavLink
              to="/favoritos"
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-stone-100 text-stone-800"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                }`
              }
            >
              Favoritos
            </NavLink>

            <NavLink
              to="/login"
              className="ml-2 rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Iniciar sesión
            </NavLink>
          </div>
        </div>
      </nav>

      <Routes>
        {/* INICIO */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-[#F5F5F2] text-stone-800">
              <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-stone-800">
                      Explora<span className="text-[#A3A39A]">.</span>
                    </h1>
                    <p className="text-sm text-stone-500">
                      Descubrí lugares cerca tuyo
                    </p>
                  </div>

                  <span className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-stone-600">
                    MAPA INTERACTIVO
                  </span>
                </div>
              </header>

              <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="mb-7">
                  <h2 className="text-3xl font-bold tracking-tight text-stone-800">
                    ¿A dónde querés ir?
                  </h2>
                  <p className="mt-2 text-stone-500">
                    Buscá un destino o descubrí lugares cercanos a tu ubicación.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
                  <aside className="space-y-5">
                    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                      <div className="mb-4">
                        <h3 className="font-semibold text-stone-800">
                          Tu ubicación
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                          Utilizá tu ubicación actual como punto de partida.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={detectarUbicacion}
                        disabled={ubicando}
                        className="w-full rounded-xl bg-stone-800 px-4 py-3 font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {ubicando
                          ? "Obteniendo ubicación..."
                          : "⌖ Detectar mi ubicación"}
                      </button>

                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            origen ? "bg-green-500" : "bg-stone-300"
                          }`}
                        ></span>
                        <span className="text-stone-500">
                          {origen
                            ? "Ubicación detectada"
                            : "Ubicación no detectada"}
                        </span>
                      </div>

                      {errorUbicacion && (
                        <p className="mt-3 text-sm text-red-600" role="alert">
                          {errorUbicacion}
                        </p>
                      )}
                    </section>

                    <Clima origen={origen} />

                    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-3 font-semibold text-stone-800">
                        Buscar un destino
                      </h3>

                      <BuscadorDestino
                        onElegirDestino={elegirDesdeAutocomplete}
                        onError={setErrorBusqueda}
                      />
                    </section>

                    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                      <h3 className="font-semibold text-stone-800">
                        Explorar cerca tuyo
                      </h3>
                      <p className="mb-4 mt-1 text-sm text-stone-500">
                        Seleccioná qué tipo de lugar querés encontrar.
                      </p>

                      <LugaresCercanos
                        onFuncion={buscarLugaresCercanos}
                        cargando={cargando}
                        deshabilitado={!origen || cargando || ubicando}
                      />

                      {!origen && (
                        <p className="mt-3 text-xs text-stone-400">
                          Primero necesitás autorizar tu ubicación.
                        </p>
                      )}

                      {errorBusqueda && (
                        <p className="mt-3 text-sm text-red-600" role="alert">
                          {errorBusqueda}
                        </p>
                      )}
                    </section>
                  </aside>

                  <div className="min-w-0 space-y-6">
                    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
                      <Mapa
                        marcadores={marcadores}
                        origen={origen}
                        destino={detalle}
                        ruta={ruta}
                      />
                    </section>

                    <Recomendaciones />

                    {detalle && (
                      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-bold text-stone-800">
                            Detalle del lugar
                          </h3>

                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                            Destino seleccionado
                          </span>
                        </div>

                        <h4 className="text-xl font-semibold text-stone-800">
                          {detalle.nombre}
                        </h4>

                        <p className="mt-2 text-sm text-stone-500">
                          {detalle.direccion}
                        </p>

                        {detalle.categoria && (
                          <p className="mt-3 text-sm text-stone-600">
                            Categoría: {detalle.categoria}
                          </p>
                        )}

                        {detalle.estado && (
                          <p className="mt-1 text-sm text-stone-600">
                            Estado:{" "}
                            {detalle.estado === "OPERATIONAL"
                              ? "Operativo"
                              : detalle.estado}
                          </p>
                        )}

                        {!origen && (
                          <p className="mt-4 text-sm text-amber-700">
                            Detectá tu ubicación para calcular el recorrido.
                          </p>
                        )}

                        {cargandoRuta && (
                          <p className="mt-4 text-sm text-stone-500">
                            Calculando recorrido a pie...
                          </p>
                        )}

                        {distanciaKm != null && (
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-stone-100 p-4">
                              <p className="text-sm text-stone-500">
                                Distancia
                              </p>
                              <p className="mt-1 text-2xl font-bold text-stone-800">
                                {distanciaKm} km
                              </p>
                            </div>

                            <div className="rounded-xl bg-stone-100 p-4">
                              <p className="text-sm text-stone-500">
                                Tiempo estimado
                              </p>
                              <p className="mt-1 text-2xl font-bold text-stone-800">
                                {duracionMinutos} min
                              </p>
                            </div>
                          </div>
                        )}

                        {errorRuta && (
                          <p className="mt-3 text-sm text-red-600" role="alert">
                            {errorRuta}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={manejarGuardarFavorito}
                          disabled={!usuario}
                          className="mt-5 rounded-xl bg-stone-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {usuario
                            ? "Guardar en favoritos"
                            : "Iniciá sesión para guardar"}
                        </button>
                      </section>
                    )}

                    {cargando ? (
                      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-stone-500 shadow-sm">
                        Buscando lugares cercanos...
                      </div>
                    ) : (
                      busquedaRealizada && (
                        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                          <h3 className="mb-4 text-lg font-bold text-stone-800">
                            Lugares encontrados
                          </h3>

                          <DetallesLugares
                            marcadores={marcadores}
                            onVerDetalle={consultarLugares}
                            cargandoDetalle={cargandoRuta}
                          />
                        </section>
                      )
                    )}
                  </div>
                </div>
              </main>
            </div>
          }
        />
        <Route
          path="/login"
          element={
            <Autenticacion
              usuario={usuario}
              comprobarSesion={comprobarSesion}
            />
          }
        />
        <Route
          element={
            <RutaProtegida
              usuario={usuario}
              comprobarSesion={comprobarSesion}
            />
          }
        >
          {" "}
          <Route path="/favoritos" element={<Favoritos usuario={usuario} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
