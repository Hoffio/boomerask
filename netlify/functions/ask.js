// netlify/functions/ask.js
const openai = require("openai");

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed, please use POST' })
    };
  }

  try {
    // Parse the request body with error handling
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    
    const { question } = requestBody;
    
    // Validate question
    if (!question || typeof question !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Question is required and must be a string' })
      };
    }
    
    // Validate question length
    if (question.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Question cannot be empty' })
      };
    }
    
    if (question.length > 500) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Question is too long. Please limit to 500 characters.' })
      };
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OpenAI API key');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Configure OpenAI API with new client
   const openaiClient = new openai.OpenAIApi(
  new openai.Configuration({
    apiKey: process.env.OPENAI_API_KEY
  })
);

    // Create a system message that instructs the AI to be senior-friendly
    const systemMessage = `You are a helpful assistant for seniors using the BoomerAsk website.

    GUIDELINES:
    - Use clear, simple language at approximately an 8th grade reading level
    - Break down complex topics into digestible parts
    - Avoid technical jargon and acronyms unless you explain them
    - Use short paragraphs and sentences
    - When discussing health topics, encourage consulting healthcare professionals
    - For technology questions, provide step-by-step instructions with clear action items
    - If you're uncertain about information, clearly state your limitations
    - When appropriate, suggest reliable sources like government websites (.gov) or established organizations
    
    FOCUS AREAS:
    - Healthcare and wellness for seniors
    - Technology help in simple terms
    - Retirement and financial planning basics
    - Family relationships and caregiving
    - Home safety and accessibility
    - Travel tips for seniors
    - Community resources and programs for older adults`;

    // Set a timeout for the OpenAI API call
    const timeoutMs = 9500; // Netlify functions have a 10s timeout, so we set slightly less
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      // Make the API request to OpenAI using the new client format
      const response = await openaiClient.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: systemMessage },
    { role: "user", content: question }
  ],
  temperature: 0.7,
  max_tokens: 500,
  presence_penalty: 0.1,
  frequency_penalty: 0.1,
        signal: controller.signal
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
    } finally {
      clearTimeout(timeoutId);
    }
catch (error) {
    console.error('Error processing request:', error);
    console.error('Error details:', JSON.stringify({
      name: error.name,
      message: error.message,
      stack: error.stack,
      status: error.status,
      apiKey: process.env.OPENAI_API_KEY ? 'API key exists' : 'API key missing'
    }));
    
    // Handle timeout errors specifically
    if (error.name === 'AbortError') {
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({ 
          error: 'The request took too long to process. Please try again with a simpler question.',
          debug: error.message
        })
      };
    }
    
    // Handle rate limit errors
    if (error.status === 429) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Our service is currently experiencing high demand. Please try again in a few moments.',
          debug: error.message
        })
      };
    }
    
    // Return detailed error information
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An error occurred while processing your question',
        debug: error.message,
        type: error.name,
        apiKeyExists: process.env.OPENAI_API_KEY ? true : false
      })
    };
}
