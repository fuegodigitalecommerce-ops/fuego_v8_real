// api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { keyword, country } = req.query;
    if (!keyword) return res.status(400).json({ ok: false, error: "Falta palabra clave" });

    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCx = process.env.GOOGLE_CX_ID;
    const meliUrl = process.env.MELI_API_URL || "https://api.mercadolibre.com/sites/";

    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[(country || "CO").toUpperCase()] || "MCO";

    console.log("🔍 Buscando:", keyword, "en", site);

    // 1️⃣ MercadoLibre
    let meliResults = [];
    try {
      const meliRes = await fetch(`${meliUrl}${site}/search?q=${encodeURIComponent(keyword)}&limit=8`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; FUEGO-LATAM/1.0; +https://fuego-v8-real.vercel.app)",
    "Accept": "application/json"
  }
});

      const meliData = await meliRes.json();
      console.log("📦 MercadoLibre:", meliData?.results?.length || 0, "resultados");

      meliResults = (meliData.results || []).map(item => ({
        title: item.title,
        price: item.price,
        link: item.permalink,
        image: item.thumbnail?.replace("http:", "https:"),
        source: "MercadoLibre",
      }));
    } catch (e) {
      console.error("❌ Error MercadoLibre:", e);
    }

    // 2️⃣ Google Images
    let googleResults = [];
    if (googleKey && googleCx) {
      try {
        const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(keyword)}&cx=${googleCx}&key=${googleKey}&searchType=image&num=6`;
        const googleRes = await fetch(googleUrl);
        const googleData = await googleRes.json();

        console.log("🖼️ Google Images:", googleData?.items?.length || 0, "imágenes");

        googleResults = (googleData.items || []).map(item => ({
          title: item.title,
          image: item.link,
          link: item.image?.contextLink || item.link,
          source: "Google Images",
        }));
      } catch (e) {
        console.error("❌ Error Google:", e);
      }
    }

    const results = [...meliResults, ...googleResults];

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: results.length,
      results,
    });
  } catch (error) {
    console.error("🔥 Error trends:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: String(error.message || error),
    });
  }
}
