import React, { useState } from "react";

export default Home;
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
      const res = await fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}&country=${encodeURIComponent(country)}`);
      const data = await res.json();
      if (data.ok) setResults(data.results);
      else setError(data.error || "Sin resultados 🔍");
    } catch (e) {
      setError("Error conectando con el servidor ❌");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#0b0b0b", color: "#fff", minHeight: "100vh", textAlign: "center", padding: "40px" }}>
      <h1 style={{ fontSize: "48px", margin: "0 0 10px" }}>🔥 FUEGO LATAM 🔥</h1>
      <p style={{ marginTop: 0 }}>Descubre los productos en tendencia en tu país</p>

      <div style={{ margin: "20px" }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Ej: navidad, moda, hogar..."
          style={{ padding: "12px", borderRadius: "8px", width: "280px", border: "none", marginRight: "10px" }}
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", marginLeft: "10px" }}
        >
          <option value="">Seleccionar país</option>
          <option value="CO">🇨🇴 Colombia</option>
          <option value="MX">🇲🇽 México</option>
          <option value="AR">🇦🇷 Argentina</option>
          <option value="CL">🇨🇱 Chile</option>
          <option value="PE">🇵🇪 Perú</option>
        </select>
        <button onClick={handleSearch} style={{ marginLeft: "12px", padding: "12px 22px", background: "red", color: "white", borderRadius: "8px", border: "none" }}>
          Encender FUEGO
        </button>
      </div>

      {loading && <p>🔥 Buscando tendencias...</p>}
      {error && <p style={{ color: "#ff8b8b" }}>{error}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: "30px" }}>
        {results.map((item, i) => (
          <div key={i} style={{ background: "#111318", borderRadius: "10px", margin: "10px", padding: "12px", width: "240px", textAlign: "left" }}>
            {item.image && (
              <img src={item.image} alt={item.title} style={{ width: "100%", borderRadius: "8px", objectFit: "cover", height: "140px" }} />
            )}
            <h4 style={{ fontSize: "16px", margin: "8px 0" }}>{item.title}</h4>
            <p style={{ color: "#bbb", fontSize: "0.88em", margin: "0 0 8px" }}>{item.source}</p>
            {item.price && <p style={{ margin: 0 }}>💰 {item.price}</p>}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#ffb86b", display: "inline-block", marginTop: "8px" }}>
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
