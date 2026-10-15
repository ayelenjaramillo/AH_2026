import { useState, useEffect } from "react";

const Escuela = ()=>{

const [datos, setDatos] = useState([])
useEffect(()=>{
 async function pedirEscuelas(){
    try {
        const respuesta = await fetch("https://apis.datos.gob.ar/georef/api/v2.0/establecimientos-educativos?provincia=Chubut")
        const datosApi = await respuesta.json()

        setDatos(datosApi.establecimientos_educativos);
        console.log("datos de API:" ,datosApi);
    
    } catch (error) {
        console.error(error)
    }
 }

 pedirEscuelas(); 
}, [])

return (
    <>
      <h1>Escuelas Chubut</h1>
  
      {datos.map((escuela) => (
        <div key={escuela.id}>
          <p>{escuela.nombre}</p>
          <p>{escuela.departamento.nombre}</p>
          <p>
            Latitud: {escuela.centroide.lat} -
            Longitud: {escuela.centroide.lon}
          </p>
        </div>
      ))}
    </>
  );

}
export default Escuela; 