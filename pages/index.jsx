import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("CO");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!keyword.trim()) return alert("🔥 Escribe una palabra clave para encender el fuego.");
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}&country=${country}`);
      const data = await res.json();
      if (data.ok) {
        setResults(data.results);
        if (data.results.length === 0) {
          setError("🕯️ Sin resultados en Google ni MercadoLibre.");
        }
      } else {
        setError(data.error || "⚠️ Error en la búsqueda.");
      }
    } catch (err) {
      setError("🔥 Error conectando con el servidor.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🔥 FUEGO Trends LATAM</h1>
        <p style={styles.subtitle}>
          Descubre lo que está ardiendo en tendencias por país
        </p>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Ej: Navidad, moda, celulares..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={styles.input}
          />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={styles.select}
          >
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

        {loading && <p style={styles.loading}>🔥 Buscando tendencias...</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.grid}>
          {results.map((item, index) => (
            <div key={index} style={styles.card}>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  style={styles.image}
                />
              )}
              <h3 style={styles.itemTitle}>{item.title}</h3>
              {item.price && <p style={styles.price}>💲 {item.price.toLocaleString()}</p>}
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                🔗 Ver en {item.source}
              </a>
            </div>
          ))}
        </div>

        <footer style={styles.footer}>
          Hecho con 🔥 por el equipo <b>FUEGO LATAM</b> © 2025
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#ffece2",
    minHeight: "100vh",
    fontFamily: "Poppins, sans-serif",
    color: "#333",
  },
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 36,
    color: "#ff3d00",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 30,
  },
  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 30,
  },
  input: {
    padding: 10,
    fontSize: 16,
    width: 220,
    border: "2px solid #ff7043",
    borderRadius: 10,
  },
  select: {
    padding: 10,
    fontSize: 16,
    border: "2px solid #ff7043",
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#ff3d00",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginTop: 30,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
    transition: "0.3s",
  },
  image: {
    width: "100%",
    height: 160,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    color: "#ff3d00",
    fontWeight: "600",
  },
  price: {
    color: "#333",
    marginTop: 5,
  },
  link: {
    color: "#0277bd",
    textDecoration: "none",
    fontWeight: "bold",
  },
  loading: {
    color: "#ff3d00",
    fontSize: 18,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  footer: {
    marginTop: 40,
    fontSize: 14,
    color: "#777",
  },
};
