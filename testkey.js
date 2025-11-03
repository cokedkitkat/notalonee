import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testKey() {
  try {
    const response = await openai.models.list();
    console.log("✅ API Key is valid. Models available:", response.data.length);
  } catch (err) {
    console.error("❌ API Key test failed:", err.message);
  }
}

testKey();
