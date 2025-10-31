export default async function handler(req, res) {
  try {
    const { keyword = "navidad", country = "CO" } = req.query;

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID;
    const MELI_API_URL = process.env.MELI_API_URL || "https://api.mercadolibre.com/sites/";

    // 1️⃣ --- INTENTAR BÚSQUEDA EN GOOGLE CUSTOM SEARCH ---
    const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      keyword
    )}&cx=${GOOGLE_CX_ID}&key=${GOOGLE_API_KEY}&num=6&searchType=image`;

    const googleRes = await fetch(googleUrl, {
      headers: { "User-Agent": "FUEGO_V8_REAL/1.0" },
    });

    let googleData = null;
    try {
      googleData = await googleRes.json();
    } catch (err) {
      console.error("⚠️ Error parseando JSON de Google:", err);
    }

    // 2️⃣ --- SI GOOGLE DA RESULTADOS ---
    if (googleData && googleData.items && googleData.items.length > 0) {
      const results = googleData.items.map((item) => ({
        title: item.title || "Resultado sin título",
        link: item.link,
        image: item.pagemap?.cse_image?.[0]?.src || item.link,
        source: "GOOGLE",
      }));

      return res.status(200).json({
        ok: true,
        keyword,
        country,
        resultsCount: results.length,
        results,
      });
    }

    // 3️⃣ --- SI GOOGLE NO DA RESULTADOS, USAR MERCADOLIBRE ---
    const meliUrl = `${MELI_API_URL}${country}/search?q=${encodeURIComponent(keyword)}`;
    const meliRes = await fetch(meliUrl);
    const meliData = await meliRes.json();

    if (meliData && meliData.results && meliData.results.length > 0) {
      const results = meliData.results.slice(0, 6).map((item) => ({
        title: item.title,
        link: item.permalink,
        image: item.thumbnail,
        price: item.price,
        source: "MERCADOLIBRE",
      }));

      return res.status(200).json({
        ok: true,
        keyword,
        country,
        resultsCount: results.length,
        results,
      });
    }

    // 4️⃣ --- SI NINGUNO DEVUELVE RESULTADOS ---
    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: 0,
      results: [],
      message: "Sin resultados en Google ni MercadoLibre.",
    });
  } catch (error) {
    console.error("🔥 Error interno:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: error.message,
    });
  }
}
