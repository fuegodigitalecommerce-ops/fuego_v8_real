// /api/trends.js  (Node / Vercel Serverless - CommonJS/ESM compatible)
export default async function handler(req, res) {
  try {
    const { keyword = "", country = "CO" } = req.query;

    if (!keyword || !String(keyword).trim()) {
      return res.status(400).json({ ok: false, error: "Falta 'keyword'." });
    }

    // Variables de entorno (asegúrate que tengan exactamente estos nombres en Vercel)
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
    const GOOGLE_CX = process.env.GOOGLE_CX_ID || ""; // tu CX (ID de buscador)
    const MELI_API = process.env.MELI_API_URL || "https://api.mercadolibre.com";

    // Mapeo por país -> site de MercadoLibre
    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[(country || "CO").toUpperCase()] || "MCO";

    // Helper: fetch con timeout y user-agent
    const fetchWithTimeout = async (url, opts = {}) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const headers = {
          "User-Agent": "FUEGO-API/1.0 (+https://fuego.example)",
          "Accept": "application/json, text/plain, */*",
          ...(opts.headers || {}),
        };
        const r = await fetch(url, { ...opts, signal: controller.signal, headers });
        clearTimeout(timeout);
        return r;
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    };

    // 1) Google Custom Search (imágenes + snippets) - opcional si claves no disponibles
    let googleResults = [];
    if (GOOGLE_API_KEY && GOOGLE_CX) {
      try {
        const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
          keyword
        )}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&num=6&searchType=image`;
        const gRes = await fetchWithTimeout(googleUrl);
        // si google responde html o error, lanzará en parse
        const gData = await gRes.json();
        if (Array.isArray(gData.items)) {
          googleResults = gData.items.map((it) => ({
            title: it.title || it.snippet || "",
            link: it.link || it.image?.contextLink || "",
            image: it.link || (it.image && it.image.thumbnailLink) || "",
            source: "Google Images",
          }));
        } else {
          console.warn("Google CustomSearch returned no items", gData);
        }
      } catch (err) {
        console.error("Google API error:", String(err));
        // no abortar todo: dejamos googleResults = []
      }
    } else {
      console.warn("GOOGLE_API_KEY or GOOGLE_CX_ID missing");
    }

    // 2) MercadoLibre search (public endpoint) - añadir cabeceras
    let meliResults = [];
    try {
      const meliUrl = `${MELI_API}/sites/${site}/search?q=${encodeURIComponent(keyword)}&limit=8`;
      const mRes = await fetchWithTimeout(meliUrl, {
        headers: { "Accept": "application/json" },
      });
      // manejo 403 explícito
      if (mRes.status === 403 || mRes.status === 401) {
        console.warn("MercadoLibre returned", mRes.status);
        throw new Error(`ML forbidden ${mRes.status}`);
      }
      const mData = await mRes.json();
      if (Array.isArray(mData.results)) {
        meliResults = mData.results.slice(0, 8).map((it) => ({
          title: it.title,
          link: it.permalink,
          image: it.thumbnail,
          price: it.price,
          source: "MercadoLibre",
        }));
      }
    } catch (err) {
      console.error("MercadoLibre error:", String(err));
      // fallback: no abortar todo
    }

    // 3) Combinar con prioridad: MercadoLibre (productos) primero y luego google
    const combined = [...meliResults, ...googleResults];

    // Si no hay resultados reales, devolvemos ejemplo sensible (no inventado) o vacío
    const message =
      combined.length > 0 ? `🔥 ${combined.length} resultados encontrados` : "Sin resultados en Google ni MercadoLibre.";

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: combined.length,
      results: combined,
      message,
    });
  } catch (error) {
    console.error("Unhandled error in /api/trends:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: String(error?.message || error),
    });
  }
}
