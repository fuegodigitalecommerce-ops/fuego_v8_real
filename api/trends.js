// --- /api/trends.js ---
// Versión estable y funcional para FUEGO Trends LATAM 🔥
// Compatible con Google Programmable Search (Custom Search JSON API) y MercadoLibre

export default async function handler(req, res) {
  try {
    const { keyword = "", country = "CO" } = req.query;

    if (!keyword) {
      return res.status(400).json({
        ok: false,
        error: "Falta el parámetro 'keyword'.",
      });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.ID_de_cliente_de_Google;
    const MELI_API = process.env.URL_de_la_API_de_MELI || "https://api.mercadolibre.com";

    // ------------------ 🔍 BÚSQUEDA EN GOOGLE ------------------
    let googleResults = [];
    try {
      const googleURL = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        keyword
      )}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&num=5`;

      const gRes = await fetch(googleURL);
      const gData = await gRes.json();

      if (gData.error) {
        console.error("❌ Error de Google API:", gData.error);
      } else if (gData.items && gData.items.length > 0) {
        googleResults = gData.items.map((item) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          image:
            item.pagemap?.cse_image?.[0]?.src ||
            "https://cdn-icons-png.flaticon.com/512/281/281764.png",
          source: "Google",
        }));
      } else {
        console.log("⚠️ Google no devolvió resultados para:", keyword);
      }
    } catch (err) {
      console.error("🚨 Error al consultar Google:", err);
    }

    // ------------------ 🛒 BÚSQUEDA EN MERCADO LIBRE ------------------
    let meliResults = [];
    try {
      const meliURL = `${MELI_API}/sites/MCO/search?q=${encodeURIComponent(keyword)}`;
      const mRes = await fetch(meliURL);
      const mData = await mRes.json();

      if (mData.results && mData.results.length > 0) {
        meliResults = mData.results.slice(0, 5).map((item) => ({
          title: item.title,
          link: item.permalink,
          image: item.thumbnail,
          price: item.price,
          source: "MercadoLibre",
        }));
      } else {
        console.log("⚠️ MercadoLibre no devolvió resultados para:", keyword);
      }
    } catch (err) {
      console.error("🚨 Error al consultar MercadoLibre:", err);
    }

    // ------------------ 📊 COMBINAR RESULTADOS ------------------
    const combined = [...googleResults, ...meliResults];

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: combined.length,
      results: combined,
      message:
        combined.length > 0
          ? `🔥 ${combined.length} resultados encontrados.`
          : "Sin resultados en Google ni MercadoLibre.",
    });
  } catch (error) {
    console.error("💥 Error general del servidor:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: error.message,
    });
  }
}
