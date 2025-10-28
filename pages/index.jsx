import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("CO");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!keyword.trim()) return alert("Por favor escribe una palabra clave 🔥");
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}&country=${country}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      alert("Error obteniendo datos 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔥 FUEGO Trends LATAM</h1>
      <p style={styles.subtitle}>Descubre lo que está ardiendo en tendencias por país</p>

      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Buscar tendencia (ej: navidad)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.input}
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={styles.select}
        >
          <option value="">Seleccionar país</option>
          <option value="CO">🇨🇴 Colombia</option>
          <option value="MX">🇲🇽 México</option>
          <option value="AR">🇦🇷 Argentina</option>
          <option value="CL">🇨🇱 Chile</option>
          <option value="PE">🇵🇪 Perú</option>
        </select>
        <button onClick={handleSearch} style={styles.button}>
          🔥 Encender Fuego
        </button>
      </div>

      {loading && <p style={styles.loading}>Buscando tendencias...</p>}

      <div style={styles.grid}>
        {results.map((item, index) => (
          <div key={index} style={styles.card}>
            <img src={item.image} alt={item.title} style={styles.image} />
            <h3 style={styles.cardTitle}>{item.title}</h3>
            <p style={styles.source}>Fuente: {item.source}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={styles.link}>
              Ver más 🔗
            </a>
          </div>
        ))}
      </div>

      {!loading && results.length === 0 && (
        <p style={styles.noResults}>💭 Aún no hay resultados... ¡Enciende el fuego arriba!</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "2rem",
    background: "linear-gradient(180deg, #fff6f0, #ffe4d0)",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2.5rem",
    color: "#e63946",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#555",
    marginBottom: "1.5rem",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  input: {
    padding: "0.7rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "220px",
  },
  select: {
    padding: "0.7rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    backgroundColor: "#ff5722",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1.5rem",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "0.3s",
  },
  loading: {
    color: "#ff5722",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
    marginTop: "2rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
    padding: "1rem",
    transition: "transform 0.2s ease-in-out",
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  cardTitle: {
    color: "#333",
    fontSize: "1.1rem",
    margin: "0.8rem 0 0.3rem",
  },
  source: {
    color: "#888",
    fontSize: "0.9rem",
  },
  link: {
    display: "inline-block",
    marginTop: "0.6rem",
    color: "#ff5722",
    textDecoration: "none",
    fontWeight: "bold",
  },
  noResults: {
    color: "#777",
    marginTop: "1.5rem",
  },
};
