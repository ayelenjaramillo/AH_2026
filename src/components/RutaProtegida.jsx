import { Navigate, Outlet } from "react-router"

const RutaProtegida = ({usuario, comprobarSesion})=>{
if(comprobarSesion){
    return <p>Comprobando sesion ... </p>
}
if(!usuario){
    return <Navigate to="/login" replace/>
}

return <Outlet/>

}
export default RutaProtegida