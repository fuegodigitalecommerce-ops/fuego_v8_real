import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("CO");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!keyword.trim()) return alert("🔥 Escribe una palabra primero");
    setLoading(true);
    setResults([]);
    setError("");

    try {
      const res = await fetch(`/api/trends?keyword=${keyword}&country=${country}`);
      const data = await res.json();
      if (data.ok) setResults(data.results);
      else setError("Sin resultados 🔍");
    } catch (e) {
      setError("Error conectando con el servidor ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", textAlign: "center", padding: "30px" }}>
      <h1>🔥 FUEGO LATAM 🔥</h1>
      <p>Descubre los productos en tendencia en tu país</p>

      <div style={{ margin: "20px" }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Ej: navidad, moda, hogar..."
          style={{ padding: "10px", borderRadius: "5px", width: "250px" }}
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", marginLeft: "10px" }}
        >
          <option value="">Seleccionar país</option>
          <option value="CO">🇨🇴 Colombia</option>
          <option value="MX">🇲🇽 México</option>
          <option value="AR">🇦🇷 Argentina</option>
          <option value="CL">🇨🇱 Chile</option>
          <option value="PE">🇵🇪 Perú</option>
        </select>
        <button onClick={handleSearch} style={{ marginLeft: "10px", padding: "10px 20px", background: "red", color: "white", borderRadius: "5px" }}>
          Encender FUEGO
        </button>
      </div>

      {loading && <p>🔥 Buscando tendencias...</p>}
      {error && <p>{error}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: "30px" }}>
        {results.map((item, i) => (
          <div key={i} style={{ background: "#111", borderRadius: "10px", margin: "10px", padding: "10px", width: "220px" }}>
            {item.image && (
              <img src={item.image} alt={item.title} style={{ width: "100%", borderRadius: "10px" }} />
            )}
            <h4>{item.title}</h4>
            <p style={{ color: "gray", fontSize: "0.9em" }}>{item.source}</p>
            {item.price && <p>💰 ${item.price.toLocaleString()}</p>}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "orange" }}>
                Ver producto 🔗
              </a>
            )}
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "50px" }}>
        Hecho con 🔥 por el equipo FUEGO © 2025
      </footer>
    </div>
  );
}
