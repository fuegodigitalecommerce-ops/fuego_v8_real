// pages/api/trends.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { keyword, country } = req.query;
    if (!keyword) {
      return res.status(400).json({ ok: false, error: "Falta palabra clave 🔍" });
    }

    const googleKey = process.env.GOOGLE_API_KEY;
    const googleCx = process.env
