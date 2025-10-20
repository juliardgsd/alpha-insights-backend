import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Rota para chamar OpenAI
app.post('/api/analyze', async (req, res) => {
  try {
    const { question, dataContext } = req.body;

    if (!question || !dataContext) {
      return res.status(400).json({ error: 'Faltam dados' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Chave OpenAI não configurada' });
    }

    const prompt = `Você é um assistente de análise de vendas para a empresa Alpha Insights.

Contexto dos dados:
${dataContext}

Pergunta do usuário: ${question}

Responda de forma concisa e objetiva, com insights práticos.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente inteligente de análise de vendas. Forneça insights práticos e acionáveis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'Erro na API OpenAI' 
      });
    }

    res.json({ 
      response: data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend Alpha Insights rodando!', status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
