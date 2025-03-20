// api/ask.js - Serverless function to handle AI requests
const { Configuration, OpenAIApi } = require("openai");

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, please use POST' });
  }

  try {
    // Get the question from the request body
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Configure OpenAI API
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Create a system message that instructs the AI to be senior-friendly
    const systemMessage = `You are a helpful assistant for seniors using the BoomerAsk website. 
    Provide clear, concise answers with simple language. Avoid technical jargon.
    When appropriate, include reliable sources for your information.
    If you're uncertain about information, clearly state that.
    Focus on topics relevant to seniors like healthcare, technology help, retirement, and family.`;

    // Make the API request to OpenAI
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract the AI's response
    const answer = response.data.choices[0].message.content;

    // Return the answer
    return res.status(200).json({ 
      answer,
      sources: "Information provided by OpenAI's GPT-3.5 model"
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your question',
      message: error.message 
    });
  }
};
