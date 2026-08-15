import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// Shared Gemini SDK client initialization
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY variable is missing in process.env. Chat assistant will run in fallback offline help mode.");
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: AI Construction Assistant Proxy Route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array in request body." });
    }

    if (!ai) {
      // Return beautiful Indian fallback advisor responses if Gemini API Key isn't provided yet
      const fallbackReplies = [
        "To compile with Indian construction practices (IS Code 456), please ensure that Concrete Mix ratio for columns is at least M25 grade (1:1:2) or higher.",
        "To calculate concrete cement Bags needed: 1 Cubic Meter of M20 grade concrete roughly consumes 8.2 bags of cement, 15 cft sand, and 30 cft aggregate coarser grit.",
        "GST compliance tip: Construction builder contracts inside India are taxed at 18% with Input Tax Credit (ITC) advantages, or 5% flat for affordable housing schemes without ITC.",
        "As a professional Indian Builder Advisor: Please monitor daily worker attendance. Standard supervisory rates vary from ₹800 to ₹1200, whereas brick masons demand around ₹600 to ₹800 per active day shift.",
        "Low stock cement alert! We recommend issuing a purchase order to Ultratech, ACC or Ambuja immediately. Keep a pipeline buffer of at least 150 bags on site."
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return res.json({
        text: `🚩 [Local Advisor Fallback] (Configure GEMINI_API_KEY in Secrets for live AI reasoning)\n\n${randomReply}\n\nIs there anything else I can estimate for Gokuldham Heights or Rajputana Villa?`
      });
    }

    // Format historical messages correctly
    // Since we use ai.models.generateContent or chats, let's keep it simple and robust with generateContent
    const historyPrompt = messages.map((m: any) => `${m.role === 'user' ? 'Client/Builder Prompt:' : 'Advisor Response:'} ${m.content}`).join("\n");
    const systemIns = `You are the chief "AI Construction Advisor & Gst Estimator" for a premium modular Indian real-estate & logistics builder.
You understand Indian building materials (Ultratech Cement, TMT steel, fly ash bricks, double charged vitrified tiles, sand in brass units).
You are fluent in Indian real-estate regulations (RERA, IS Code-456 for concrete, Indian GST rates which is 18% for commercial/residential contracts with Input Tax Credit, and 5% or 1% for affordable residential ventures).
Calculate materials roughly if the client asks (e.g., standard thumb rules: 0.4 bags cement per sq ft of builtup area, 4kg steel per sq ft, 1.2 cft aggregate sand).
Current Context State of Construction App: ${JSON.stringify(context || {})}
Keep responses structurally formatted with bullet points, high-contrast human explanations, polite, professional, and grounded in Indian builders mindset.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: historyPrompt }
      ],
      config: {
        systemInstruction: systemIns,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I was unable to formulate a sound response. Let me check the specifications again.";
    
    return res.json({ text: replyText });
  } catch (err: any) {
    console.error("Gemini API Error in proxy route:", err);
    return res.status(500).json({
      error: "Error from Gemini backend: " + err.message,
      text: "🚩 Note: The AI assistant had an execution delay. Make sure the API Key is active in your Settings."
    });
  }
});

// Simple API status checks
app.get("/api/health", (req, res) => {
  res.json({
    status: 'ok',
    apiKeyPresent: !!apiKey,
    localTime: new Date().toISOString()
  });
});

// Vite middleware setup for Development & Production bundling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
