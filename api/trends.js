export default async function handler(req, res) {
  try {
    const { keyword, country = "CO" } = req.query;

    if (!keyword) {
      return res.status(400).json({ ok: false, error: "Falta palabra clave" });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID;

    if (!GOOGLE_API_KEY || !GOOGLE_CX_ID) {
      return res.status(500).json({ ok: false, error: "Faltan claves de Google" });
    }

    // 🔥 Llamada a Google Custom Search
    const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      keyword
    )}&cx=${GOOGLE_CX_ID}&key=${GOOGLE_API_KEY}&searchType=image&num=8`;

    const googleRes = await fetch(googleUrl);
    const googleData = await googleRes.json();

    if (!googleData.items) {
      console.error("Respuesta de Google:", googleData);
      return res.status(200).json({
        ok: true,
        keyword,
        country,
        resultsCount: 0,
        results: [],
      });
    }

    const googleResults = googleData.items.map((item) => ({
      title: item.title,
      link: item.image?.contextLink || item.link,
      image: item.link,
      source: "Google Images",
    }));

    return res.status(200).json({
      ok: true,
      keyword,
      country,
      resultsCount: googleResults.length,
      results: googleResults,
    });
  } catch (error) {
    console.error("Error trends:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno en el servidor 🔥",
      detalle: error.message,
    });
  }
}
