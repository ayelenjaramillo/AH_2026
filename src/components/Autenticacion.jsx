
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const Autenticacion = ({ usuario, comprobarSesion }) => {
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [modo, setModo] = useState("login");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  function cambiarModo() {
    setModo((modoAnterior) =>
      modoAnterior === "login" ? "registro" : "login"
    );
    setError("");
  }

  async function formSubmit(e) {
    e.preventDefault();
    setProcesando(true);
    setError("");

    try {
      if (modo === "registro") {
        await createUserWithEmailAndPassword(auth, correo, contrasenia);
      } else {
        await signInWithEmailAndPassword(auth, correo, contrasenia);
      }
      setContrasenia("");
    } catch (error) {
      console.error(error);
      setError("No se pudo completar la operación. Revisá tus datos.");
    } finally {
      setProcesando(false);
    }
  }

  async function cerrarSesion() {
    if (procesando) return;
    setProcesando(true);

    try {
      await signOut(auth);
      setCorreo("");
      setContrasenia("");
      setModo("login");
      setError("");
    } catch (error) {
      console.error(error);
      setError("No se pudo cerrar sesión");
    } finally {
      setProcesando(false);
    }
  }

  if (comprobarSesion) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 text-sm text-stone-500">
        Comprobando sesión...
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">

        {usuario ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-lg">
                👤
              </div>

              <div>
                <p className="font-semibold text-stone-800">
                  Mi cuenta
                </p>
                <p className="text-sm text-stone-500">
                  {usuario.email}
                </p>
              </div>
            </div>

            <button
              onClick={cerrarSesion}
              disabled={procesando}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-50"
            >
              {procesando ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-stone-400">
                {modo === "login" ? "BIENVENIDO/A" : "NUEVA CUENTA"}
              </p>

              <h2 className="text-xl font-bold text-stone-800">
                {modo === "login"
                  ? "Ingresá a Explora"
                  : "Creá tu cuenta"}
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                {modo === "login"
                  ? "Accedé para disfrutar de tu experiencia."
                  : "Registrate para comenzar a explorar."}
              </p>
            </div>

            <form onSubmit={formSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Correo electrónico
                </label>

                <input
                  type="email"
                  id="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(evento) => setCorreo(evento.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                />
              </div>

              <div>
                <label
                  htmlFor="contrasenia"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Contraseña
                </label>

                <input
                  type="password"
                  id="contrasenia"
                  required
                  placeholder="Ingresá tu contraseña"
                  value={contrasenia}
                  onChange={(evento) => setContrasenia(evento.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
                />
              </div>

              <button
                type="submit"
                disabled={procesando}
                className="w-full rounded-lg bg-stone-800 py-3 font-semibold text-white transition hover:bg-stone-700 disabled:opacity-50"
              >
                {procesando
                  ? "Procesando..."
                  : modo === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
              </button>
            </form>
          </>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!usuario && (
          <div className="mt-5 border-t border-stone-100 pt-5 text-center">
            <p className="text-sm text-stone-500">
              {modo === "login"
                ? "¿Todavía no tenés cuenta?"
                : "¿Ya tenés una cuenta?"}
            </p>

            <button
              type="button"
              onClick={cambiarModo}
              className="mt-2 text-sm font-semibold text-stone-700 transition hover:text-stone-500"
            >
              {modo === "login" ? "Crear una cuenta" : "Iniciar sesión"}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default Autenticacion;
