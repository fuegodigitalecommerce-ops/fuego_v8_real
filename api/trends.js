// /api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { keyword, country } = req.query;
    if (!keyword) return res.status(400).json({ ok: false, error: "Falta palabra clave 🔥" });

    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCx = process.env.GOOGLE_CX_ID;
    const meliUrl = process.env.MELI_API_URL || "https://api.mercadolibre.com/sites/";

    // 🔹 Mapeo de países a códigos de MercadoLibre
    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[(country || "CO").toUpperCase()] || "MCO";

    // 🔹 Búsqueda en MercadoLibre
    const meliEndpoint = `${meliUrl}${site}/search?q=${encodeURIComponent(keyword)}`;
    const meliRes = await fetch(meliEndpoint);
    const meliData = await meliRes.json();

    if (!meliData || !meliData.results) {
      throw new Error(`Respuesta inválida de MercadoLibre (${meliEndpoint})`);
    }

    const meliResults = meliData.results.map(item => ({
      title: item.title,
      price: item.price,
      link: item.permalink,
      image: item.thumbnail,
      source: "MercadoLibre"
    }));

    // 🔹 Búsqueda en Google Images
    let googleResults = [];
    if (googleKey && googleCx) {
      const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(keyword)}&cx=${googleCx}&key=${googleKey}&searchType=image&num=6`;
      const googleRes = await fetch(googleUrl);
      const googleData = await googleRes.json();

      googleResults = (googleData.items || []).map(item => ({
        title: item.title,
        image: item.link,
        link: item.image?.contextLink || item.link,
        source: "Google Images"
      }));
    }

    const results = [...meliResults, ...googleResults];

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: results.length,
      results
    });
  } catch (error) {
    console.error("🔥 Error en /api/trends:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: error.message
    });
  }
}
