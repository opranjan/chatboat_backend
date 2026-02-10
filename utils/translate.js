const { translate } = require("@vitalets/google-translate-api");

async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang === "en") return text;

  try {
    console.log("🌐 Translating:", text, "→", targetLang);

    const res = await translate(text, { to: targetLang });

    if (!res || !res.text) {
      console.log("⚠️ Empty translation, fallback");
      return text;
    }

    console.log("✅ Translation success:", res.text);
    return res.text;
  } catch (err) {
    console.error("❌ Google translate error:", err.message);
    return text;
  }
}

module.exports = { translateText };
