// netlify/functions/ask.js
const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS')  {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST')  {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed, please use POST' })
    };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const { question } = requestBody;
    
    if (!question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Question is required' })
      };
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        answer,
        sources: "Information provided by OpenAI's GPT-3.5 model"
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An error occurred while processing your question',
        message: error.message 
      })
    };
  }
};
