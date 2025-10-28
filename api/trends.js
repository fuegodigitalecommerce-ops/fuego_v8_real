// pages/api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { keyword, country } = req.query;
    if (!keyword) return res.status(400).json({ ok: false, error: "Falta palabra clave" });

    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCx = process.env.GOOGLE_CX_ID;
    const meliUrl = process.env.MELI_API_URL || "https://api.mercadolibre.com/sites/";

    // 1) Google Images (Custom Search) - devuelve imágenes relacionadas
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

    // 2) MercadoLibre — site por país (ejemplo simple)
    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[(country || "CO").toUpperCase()] || "MCO";
    const meliRes = await fetch(`${meliUrl}${site}/search?q=${encodeURIComponent(keyword)}&limit=8`);
    const meliData = await meliRes.json();
    const meliResults = (meliData.results || []).map(item => ({
      title: item.title,
      price: item.price,
      link: item.permalink,
      image: item.thumbnail,
      source: "MercadoLibre"
    }));

    // Combina (prioridad a MercadoLibre para productos)
    const results = [...meliResults, ...googleResults];

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: results.length,
      results
    });
  } catch (error) {
    console.error("Error trends:", error);
    return res.status(500).json({ ok: false, error: "Error al obtener datos", detalle: String(error.message || error) });
  }
}
