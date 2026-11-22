
import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    deleteDoc,
    doc
} from "firebase/firestore";

import { db } from "../firebase";


    // GUARDAR FAVORITO
  export  async function guardarFavorito(usuario, detalle) {

        const consulta = query(
            collection(db, "favoritos"),
            where("usuarioId", "==", usuario.uid),
            where("lugarId", "==", detalle.id)
        );

        const resultado = await getDocs(consulta);

        if (!resultado.empty) {
            return {
                guardado: false,
                mensaje: "Este lugar ya está guardado."
            };
        }

        await addDoc(collection(db, "favoritos"), {
            usuarioId: usuario.uid,
            lugarId: detalle.id,
            nombre: detalle.nombre,
            direccion: detalle.direccion,
            categoria: detalle.categoria || "",
            url: detalle.url || "",
            nota: ""
        });

        return {
            guardado: true,
            mensaje: "Lugar guardado en favoritos."
        };
    }


    // OBTENER FAVORITOS
   export  async function obtenerFavoritos(usuario) {

        const consulta = query(
            collection(db, "favoritos"),
            where("usuarioId", "==", usuario.uid)
        );

        const respuesta = await getDocs(consulta);

        return respuesta.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));
    }


    // ACTUALIZAR NOTA
    export async function actualizarNotaFavorito(id, nuevaNota) {

        const referencia = doc(db, "favoritos", id);

        await updateDoc(referencia, {
            nota: nuevaNota
        });
    }


    // ELIMINAR FAVORITO
    export async function eliminarFavorito(id) {

        const referencia = doc(db, "favoritos", id);

        await deleteDoc(referencia);
    }




