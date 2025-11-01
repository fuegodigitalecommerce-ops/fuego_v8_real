export default async function handler(req, res) {
  const { keyword, country } = req.query;

  if (!keyword) {
    return res.status(400).json({ ok: false, error: "Falta la palabra clave." });
  }

  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.ID_de_cliente_de_Google;
    const MELI_API = process.env.URL_de_la_API_de_MELI || "https://api.mercadolibre.com/sites";

    // --- BUSCAR EN GOOGLE CUSTOM SEARCH ---
    let googleResults = [];
    const googleURL = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      keyword
    )}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&num=4`;

    const gRes = await fetch(googleURL);
    const gData = await gRes.json();

    if (gData.items) {
      googleResults = gData.items.map((item) => ({
        title: item.title,
        link: item.link,
        image:
          item.pagemap?.cse_image?.[0]?.src ||
          item.pagemap?.thumbnail?.[0]?.src ||
          "https://cdn-icons-png.flaticon.com/512/281/281764.png",
        source: "Google",
      }));
    }

    // --- BUSCAR EN MERCADO LIBRE ---
    const meliURL = `${MELI_API}/ML${country}/search?q=${encodeURIComponent(keyword)}`;
    const mRes = await fetch(meliURL);
    const mData = await mRes.json();

    const meliResults = (mData.results || []).slice(0, 4).map((item) => ({
      title: item.title,
      price: item.price,
      link: item.permalink,
      image: item.thumbnail,
      source: "MercadoLibre",
    }));

    const combined = [...googleResults, ...meliResults];
    res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: combined.length,
      results: combined,
      message:
        combined.length > 0
          ? "Datos obtenidos correctamente."
          : "Sin resultados en Google ni MercadoLibre.",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      message: "Error interno en el servidor 🔥",
    });
  }
}
