import { useState } from "react";
import Escuela from "./components/Escuelas";
import FormDireccion from "./components/FormDireccion";
import Mapa from "./components/Mapa";

function App() {
  const [marcadores, setMarcadores] = useState([
    {
      nombre: "Plaza Independencia",
      lat: -43.24895,
      lng: -65.30505,
    },
  ]);

  function agregarMarcadorAMapa(nuevoMarcador) {
    setMarcadores([...marcadores, nuevoMarcador])
  }

  return (
    <>
      <h1>AH</h1>
      <FormDireccion agregarMarcadorAMapa={agregarMarcadorAMapa} />
      <Mapa marcadores={marcadores} />
      <Escuela />
    </>
  );
}

export default App;
