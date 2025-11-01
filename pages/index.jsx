import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("CO");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function search() {
    if (!keyword.trim()) return setMessage("Escribe una palabra clave.");
    setLoading(true); setMessage(""); setResults([]);
    try {
      const r = await fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}&country=${encodeURIComponent(country)}`);
      const j = await r.json();
      if (!j.ok) {
        setMessage(j.error || "Error al obtener resultados.");
      } else {
        setResults(j.results || []);
        setMessage(j.message || "");
      }
    } catch (err) {
      setMessage("Error de conexión con el servidor.");
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div style={{padding:30,fontFamily:"Arial, sans-serif",textAlign:"center"}}>
      <h1 style={{color:"#ff4d00"}}>🔥 FUEGO Trends LATAM</h1>
      <p>Descubre lo que está ardiendo en tendencias por país</p>

      <div style={{display:"flex",gap:12,justifyContent:"center",margin:"20px 0"}}>
        <input value={keyword} onChange={(e)=>setKeyword(e.target.value)} placeholder="Ej: navidad" style={{padding:12,borderRadius:8,width:260}} />
        <select value={country} onChange={(e)=>setCountry(e.target.value)} style={{padding:12,borderRadius:8}}>
          <option value="CO">co Colombia</option>
          <option value="MX">mx México</option>
          <option value="AR">ar Argentina</option>
          <option value="CL">cl Chile</option>
        </select>
        <button onClick={search} style={{background:"#ff5a1f",color:"#fff",border:"none",padding:"12px 20px",borderRadius:8}}>🔥 Encender FUEGO</button>
      </div>

      {loading && <p>Buscando...</p>}
      {message && <p>{message}</p>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12,maxWidth:900,margin:"20px auto"}}>
        {results.map((it,i)=>(
          <a key={i} href={it.link||"#"} target="_blank" rel="noreferrer" style={{textDecoration:"none",color:"#000",border:"1px solid #eee",padding:12,borderRadius:8}}>
            <img src={it.image||"https://via.placeholder.com/400x200?text=No+image"} alt={it.title} style={{width:"100%",height:140,objectFit:"cover",borderRadius:6}}/>
            <h3 style={{fontSize:16,margin:"8px 0"}}>{it.title}</h3>
            {it.price && <p style={{color:"#ff5a1f"}}>${it.price}</p>}
            <small style={{color:"#666"}}>Fuente: {it.source}</small>
          </a>
        ))}
      </div>
    </div>
  );
}
