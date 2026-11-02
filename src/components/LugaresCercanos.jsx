import { useState } from "react";

const LugaresCercanos = ({onFuncion}) => {
  const [tipo, setTipo] = useState("cafe");

  function onManejadorSubmit(e) {
    e.preventDefault();
  
    console.log("SE PRESIONÓ BUSCAR");
    console.log("TIPO SELECCIONADO:", tipo);
  
    onFuncion(tipo);
  }

  return(
    <>
    <form onSubmit={onManejadorSubmit} >
        <select value={tipo} onChange={(e)=>setTipo(e.target.value)}>
            <option value="cafe" >Cafeterías</option>
            <option value="restaurant">Restaurantes</option>
            <option value="pharmacy">Farmacias</option>
            <option value="museum">Museos</option>
        </select>
        <button type="submit">Buscar</button>
    </form>
    </>
  )
};
export default LugaresCercanos;
