import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { keyword, country } = req.query;
    if (!keyword) {
      return res.status(400).json({ ok: false, error: "Falta palabra clave 🔎" });
    }

    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCx = process.env.GOOGLE_CX_ID;
    const meliUrl = process.env.MELI_API_URL || "https://api.mercadolibre.com/sites/";
    const siteMap = { CO: "MCO", MX: "MLM", AR: "MLA", CL: "MLC", PE: "MPE" };
    const site = siteMap[(country || "CO").toUpperCase()] || "MCO";

    // 🔥 MERCADO LIBRE
    const meliRes = await fetch(`${meliUrl}${site}/search?q=${encodeURIComponent(keyword)}&limit=6`);
    let meliData = {};
    try {
      meliData = await meliRes.json();
    } catch {
      meliData = {};
    }

    const meliResults = (meliData.results || []).map(item => ({
      title: item.title,
      link: item.permalink,
      image: item.thumbnail,
      price: item.price,
      source: "MercadoLibre"
    }));

    // 🔥 GOOGLE IMAGES
    let googleResults = [];
    if (googleKey && googleCx) {
      const googleUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(keyword)}&cx=${googleCx}&key=${googleKey}&searchType=image&num=6`;
      const googleRes = await fetch(googleUrl);
      const googleData = await googleRes.json();

      googleResults = (googleData.items || []).map(item => ({
        title: item.title,
        link: item.image?.contextLink || item.link,
        image: item.link,
        source: "Google Images"
      }));
    }

    const results = [...meliResults, ...googleResults];

    // 👁️ Si el cliente pide HTML (desde navegador)
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      const html = `
        <html>
          <head>
            <title>🔥 FUEGO Trends - ${keyword}</title>
            <style>
              body { font-family: Arial; background: #fafafa; padding: 30px; }
              h1 { color: #d62828; }
              .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
              .card { background: white; border-radius: 10px; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
              img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; }
              .source { font-size: 0.8em; color: gray; }
            </style>
          </head>
          <body>
            <h1>🔥 Resultados para: <em>${keyword}</em></h1>
            <div class="grid">
              ${results.map(r => `
                <div class="card">
                  <a href="${r.link}" target="_blank">
                    <img src="${r.image}" alt="${r.title}" />
                  </a>
                  <h3>${r.title}</h3>
                  ${r.price ? `<p><strong>$${r.price}</strong></p>` : ""}
                  <p class="source">${r.source}</p>
                </div>
              `).join("")}
            </div>
          </body>
        </html>`;
      return res.status(200).send(html);
    }

    // Si lo pide JSON (desde API)
    return res.status(200).json({ ok: true, keyword, country, resultsCount: results.length, results });

  } catch (error) {
    console.error("🔥 Error trends:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno del servidor 🔥",
      detalle: error.message
    });
  }
}
