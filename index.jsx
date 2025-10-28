import React, { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("CO");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!keyword.trim()) return alert("🔥 Escribe una palabra clave primero!");
    setLoading(true);
    setResults([]);
    setError("");
    try {
      const res = await fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}&country=${country}`);
      const data = await res.json();
      if (data.ok) {
        setResults(data.results);
      } else {
        setError(data.error || "No se encontraron resultados.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#111", color: "#fff", minHeight: "100vh", textAlign: "center", paddingTop: "5rem" }}>
      <h1>🔥 FUEGO LATAM 🔥</h1>
      <p>Descubre los productos en tendencia en tu país</p>

      <input
        placeholder="Ej: navidad, moda, hogar..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ padding: "10px", marginRight: "10px", width: "200px" }}
      />

      <select value={country} onChange={(e) => setCountry(e.target.value)} style={{ padding: "10px", marginRight: "10px" }}>
        <option value="CO">🇨🇴 Colombia</option>
        <option value="MX">🇲🇽 México</option>
        <option value="AR">🇦🇷 Argentina</option>
        <option value="CL">🇨🇱 Chile</option>
        <option value="PE">🇵🇪 Perú</option>
      </select>

      <button onClick={handleSearch} style={{ background: "red", color: "#fff", padding: "10px 20px", border: "none" }}>
        Encender FUEGO
      </button>

      {loading && <p>🔥 Buscando tendencias...</p>}
      {error && <p>{error}</p>}

      <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", padding: "1rem" }}>
        {results.map((item, i) => (
          <div key={i} style={{ background: "#222", padding: "1rem", borderRadius: "10px" }}>
            {item.image && <img src={item.image} alt={item.title} style={{ width: "100%", borderRadius: "8px" }} />}
            <h3 style={{ fontSize: "1rem", marginTop: "10px" }}>{item.title}</h3>
            {item.price && <p>💰 {item.price.toLocaleString()} COP</p>}
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#0af" }}>
              Ver producto ({item.source})
            </a>
          </div>
        ))}
      </div>

      <p style={{ marginTop: "2rem" }}>Hecho con 🔥 por el equipo FUEGO © 2025</p>
    </div>
  );
}
