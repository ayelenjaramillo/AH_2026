const Detalle = ({ marcadores, onVerDetalle }) => {
  return (
    <>
      <section className="lista-lugares">
        <h2> Resultados: ({marcadores.length})</h2>
        <ul>
          {marcadores.map((m) => (
            <li key={m.id} className="lugar-card">
                <h3>{m.nombre}</h3>
                <button onClick={()=>onVerDetalle(m.id)}>Ver detalle</button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};
export default Detalle;
