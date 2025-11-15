require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // <-- Serve seu index.html dessa pasta

// Prompt de sistema da FLASH AI (para feira de ciências)
const SYSTEM_PROMPT = `
Você é a Flash AI, uma inteligência artificial criada para uma feira de ciências.
Seu objetivo é explicar ciência, tecnologia, espaço, curiosidades e aprendizado para crianças e adolescentes.
Você deve:
- Falar em português do Brasil.
- Ser amigável, divertida e educativa.
- Explicar conceitos de forma simples e clara.
- Não usar temas adultos ou impróprios.
- Ajudar as pessoas com exemplos fáceis de entender.
`;

// Rota principal que o frontend chama
app.post("/api/flash-ai", async (req, res) => {
  try {
    const { message } = req.body;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: "API KEY não configurada no servidor (.env)."
      });
    }

    if (!message) {
      return res.status(400).json({ error: "Mensagem não enviada." });
    }

    // Chamada à API da OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-5.1-thinking",
        input: message,
        system_prompt: SYSTEM_PROMPT,
        reasoning: { effort: "medium" },
        temperature: 0.7,
        max_output_tokens: 600
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const data = response.data;

    // Extrair texto do formato da Responses API
    const part = data.output[0].content.find(
      (c) => c.type === "output_text"
    );

    const answer = part?.text || "Não consegui gerar resposta.";

    return res.json({ answer });
  } catch (err) {
    console.error("Erro na IA:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Erro ao chamar a Flash AI.",
      details: err.response?.data || err.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Flash AI rodando em http://localhost:${PORT}`);
});
