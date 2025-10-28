// pages/api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { keyword, country } = req.query;
    if (!keyword) {
      return res.status(400).json({ ok: false, error: "Falta palabra clave 🔍" });
    }

    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCx = process.env.GOOGLE_CX_ID;
    const meliUrl = process.env.MELI_API_URL || "https://api.mercadolibre.com/sites/";

    // --- 1️⃣ GOOGLE IMAGES ---
    let googleResults = [];
    if (googleKey && googleCx) {
      const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        keyword
      )}&cx=${googleCx}&key=${googleKey}&searchType=image&num=5`;
      const googleRes = await fetch(googleUrl);
      const googleData = await googleRes.json();

      if (googleData?.items) {
        googleResults = googleData.items.map((item) => ({
          title: item.title,
          image: item.link,
          link: item.image?.contextLink || item.link,
          source: "Google Images",
        }));
      }
    }

    // --- 2️⃣ MERCADO LIBRE ---
    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[(country || "CO").toUpperCase()] || "MCO";

    const meliEndpoint = `${meliUrl}${site}/search?q=${encodeURIComponent(keyword)}&limit=8`;
    const meliRes = await fetch(meliEndpoint);
    const meliData = await meliRes.json();

    let meliResults = [];
    if (meliData?.results?.length > 0) {
      meliResults = meliData.results.map((item) => ({
        title: item.title,
        price: item.price,
        link: item.permalink,
        image: item.thumbnail,
        source: "MercadoLibre",
      }));
    } else {
      // --- 3️⃣ Fallback si MercadoLibre devuelve vacío o 403 ---
      meliResults = [
        {
          title: `Ideas populares sobre ${keyword}`,
          link: "https://www.mercadolibre.com.co",
          image: "https://http2.mlstatic.com/static/org-img/homesnw/mercado-libre.png",
          source: "FUEGO_AI",
        },
        {
          title: `Explora productos relacionados con ${keyword}`,
          link: "https://www.mercadolibre.com.co",
          image: "https://cdn-icons-png.flaticon.com/512/825/825463.png",
          source: "FUEGO_AI",
        },
      ];
    }

    // --- Combinar resultados ---
    const results = [...meliResults, ...googleResults];

    return res.status(200).json({
      ok: true,
      keyword,
      country: country || "CO",
      resultsCount: results.length,
      results,
    });
  } catch (error) {
    console.error("🔥 Error trends.js:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: error.message || String(error),
    });
  }
}
