import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("CO");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchTrends = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setMessage("");
    setResults([]);

    try {
      const res = await fetch(`/api/trends?keyword=${keyword}&country=${country}`);
      const data = await res.json();
      setResults(data.results || []);
      setMessage(data.message || "");
    } catch (err) {
      setMessage("Error al buscar resultados 🔥");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 text-center p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-2">🔥 FUEGO Trends LATAM</h1>
      <p className="mb-6 text-gray-700">
        Descubre lo que está ardiendo en tendencias por país
      </p>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Ej: Navidad, Regalos..."
          className="p-3 rounded-xl border text-center"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="p-3 rounded-xl border"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="CO">🇨🇴 Colombia</option>
          <option value="MX">🇲🇽 México</option>
          <option value="AR">🇦🇷 Argentina</option>
          <option value="CL">🇨🇱 Chile</option>
        </select>
        <button
          onClick={searchTrends}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl"
        >
          🔥 Encender Fuego
        </button>
      </div>

      {loading && <p>🔥 Buscando tendencias...</p>}
      {!loading && message && <p className="text-gray-600">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 w-full max-w-2xl">
        {results.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded-xl shadow bg-white p-4 flex flex-col hover:shadow-lg transition"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-40 object-cover rounded-xl mb-3"
            />
            <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
            {item.price && <p className="text-orange-600 mt-1">${item.price}</p>}
            <span className="text-xs text-gray-500 mt-2">
              Fuente: {item.source}
            </span>
          </a>
        ))}
      </div>

      <footer className="mt-10 text-gray-500 text-sm">
        Hecho con 🔥 por el equipo <b>FUEGO LATAM</b> © 2025
      </footer>
    </div>
  );
}
