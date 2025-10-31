// /api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { keyword, country } = req.query;
    if (!keyword)
      return res.status(400).json({ ok: false, error: "Falta palabra clave" });

    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCx = process.env.GOOGLE_CX_ID;
    const meliUrl =
      process.env.MELI_API_URL || "https://api.mercadolibre.com/sites/";

    let results = [];

    // 1️⃣ GOOGLE IMAGES
    if (googleKey && googleCx) {
      const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        keyword
      )}&cx=${googleCx}&key=${googleKey}&searchType=image&num=6`;

      const googleRes = await fetch(googleUrl);
      const googleData = await googleRes.json();

      if (googleData?.items?.length) {
        results = googleData.items.map((item) => ({
          title: item.title,
          link: item.image?.contextLink || item.link,
          image: item.link,
          source: "Google Images",
        }));
      }
    }

    // 2️⃣ MERCADO LIBRE
    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[(country || "CO").toUpperCase()] || "MCO";

    const meliRes = await fetch(
      `${meliUrl}${site}/search?q=${encodeURIComponent(keyword)}&limit=6`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; FuegoApp/1.0; +https://fuego-v8-real.vercel.app/)",
          Accept: "application/json",
        },
      }
    );

    const meliData = await meliRes.json();

    if (meliData?.results?.length) {
      results = [
        ...meliData.results.map((item) => ({
          title: item.title,
          link: item.permalink,
          image: item.thumbnail,
          price: item.price,
          source: "MercadoLibre",
        })),
        ...results,
      ];
    }

    // ✅ Resultado final combinado
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
