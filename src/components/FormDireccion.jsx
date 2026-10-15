import { useState } from "react"

const FormDireccion =({agregarMarcadorAMapa})=>{
    const [nombre, setNombre] = useState("");
    const [latitud, setLatitud] = useState("");
    const [longitud, setLongitud] = useState("")

    function enviarDire(e){
        e.preventDefault();

        const nuevoMarcador = {
            nombre, 
            lat: Number(latitud),
            lng: Number(longitud)
        };

        agregarMarcadorAMapa(nuevoMarcador)

    }


return(
    <>
    <form onSubmit={enviarDire}>
        <input placeholder="Indica tu marcacdor" value={nombre} onChange={(e)=>setNombre(e.target.value)} />
        <input placeholder="Indica la latitud" value={latitud} onChange={(e)=>setLatitud(e.target.value)} />
        <input placeholder="Indica la longitud" value={longitud} onChange={(e)=>setLongitud(e.target.value)}/>
        <button type="submit">Enviar</button>
    </form>
    </>
)


}
export default FormDireccion