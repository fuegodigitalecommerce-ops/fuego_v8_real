export default async function handler(req, res) {
  try {
    const { keyword = "", country = "CO" } = req.query;
    if (!keyword.trim()) {
      return res.status(400).json({ ok: false, error: "Falta la palabra clave 🔥" });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID;
    const MELI_API_URL = process.env.MELI_API_URL || "https://api.mercadolibre.com";

    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[country.toUpperCase()] || "MCO";

    // ----------------------------------------
    // 🔥 1. BUSQUEDA GOOGLE (Custom Search API)
    // ----------------------------------------
    let googleResults = [];
    try {
      const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        keyword
      )}&cx=${GOOGLE_CX_ID}&key=${GOOGLE_API_KEY}&num=8&searchType=image`;
      const googleRes = await fetch(googleUrl);
      const googleData = await googleRes.json();

      if (googleData.items) {
        googleResults = googleData.items.map((item) => ({
          title: item.title,
          link: item.image?.contextLink || item.link,
          image: item.link,
          source: "Google 🔎",
        }));
      } else {
        console.warn("Sin items en Google:", googleData);
      }
    } catch (error) {
      console.error("Error al obtener datos de Google:", error);
    }

    // ----------------------------------------
    // 🔥 2. BUSQUEDA MERCADOLIBRE
    // ----------------------------------------
    let meliResults = [];
    try {
      const meliUrl = `${MELI_API_URL}/sites/${site}/search?q=${encodeURIComponent(
        keyword
      )}&limit=8`;
      const meliRes = await fetch(meliUrl);
      const meliData = await meliRes.json();

      if (meliData.results) {
        meliResults = meliData.results.map((item) => ({
          title: item.title,
          price: item.price,
          link: item.permalink,
          image: item.thumbnail,
          source: "MercadoLibre 🛒",
        }));
      } else {
        console.warn("Sin resultados en MercadoLibre:", meliData);
      }
    } catch (error) {
      console.error("Error al obtener datos de MercadoLibre:", error);
    }

    // ----------------------------------------
    // 🔥 3. COMBINAR RESULTADOS
    // ----------------------------------------
    const allResults = [...meliResults, ...googleResults];

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: allResults.length,
      results: allResults,
      message:
        allResults.length > 0
          ? `🔥 ${allResults.length} resultados reales encontrados`
          : "No se encontraron resultados ni en Google ni en MercadoLibre.",
    });
  } catch (error) {
    console.error("Error trends.js:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: error.message,
    });
  }
}
