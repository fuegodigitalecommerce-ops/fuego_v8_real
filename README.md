# FUEGO LATAM v8 (starter)

API y UI minimal para mostrar tendencias y productos.

**Variables de entorno necesarias (Vercel):**
- GOOGLE_API_KEY = tu API Key de Google (Custom Search)
- GOOGLE_CX_ID = tu Custom Search Engine ID (motor)
- MELI_API_URL = https://api.mercadolibre.com/sites/   (opcional)

Carpeta `pages/` contiene UI (Next.js).  
`pages/api/trends.js` es la función serverless que combina MercadoLibre y Google Images.
