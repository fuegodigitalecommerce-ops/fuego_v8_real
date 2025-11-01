// /api/trends.js
export default async function handler(req, res) {
  try {
    const { keyword = "", country = "CO" } = req.query;
    if (!keyword.trim()) {
      return res.status(400).json({ ok: false, error: "Falta palabra clave 🔥" });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX_ID = process.env.ID_de_cliente_de_Google;
    const MELI_API_URL = process.env.URL_de_la_API_de_MELI || "https://api.mercadolibre.com/sites/";

    // --- Búsqueda en Google Custom Search ---
    let googleResults = [];
    try {
      const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        keyword
      )}&cx=${GOOGLE_CX_ID}&key=${GOOGLE_API_KEY}&searchType=image&num=6`;
      const gRes = await fetch(googleUrl);
      const gData = await gRes.json();

      if (gData.items) {
        googleResults = gData.items.map((item) => ({
          title: item.title,
          image: item.link,
          link: item.image?.contextLink || item.link,
          source: "Google Images",
        }));
      }
    } catch (err) {
      console.warn("Error con Google Search:", err.message);
    }

    // --- Búsqueda en MercadoLibre ---
    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[country.toUpperCase()] || "MCO";
    let meliResults = [];

    try {
      const meliRes = await fetch(`${MELI_API_URL}${site}/search?q=${encodeURIComponent(keyword)}&limit=6`);
      const meliData = await meliRes.json();

      if (meliData.results) {
        meliResults = meliData.results.map((item) => ({
          title: item.title,
          price: item.price,
          link: item.permalink,
          image: item.thumbnail,
          source: "MercadoLibre",
        }));
      }
    } catch (err) {
      console.warn("Error con MercadoLibre:", err.message);
    }

    const results = [...meliResults, ...googleResults];

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: results.length,
      results,
      message: results.length > 0 ? "🔥 Resultados encontrados" : "Sin resultados en Google ni MercadoLibre.",
    });
  } catch (error) {
    console.error("Error general:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: error.message,
    });
  }
}
