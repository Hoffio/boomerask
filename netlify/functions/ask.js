// Ultra-simplified ask.js function for Netlify
const axios = require('axios');

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS')  {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body || '{}');
    const question = requestBody.question || '';
    
    // Log debugging info
    console.log('Function called with question:', question);
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    
    // Simple validation
    if (!question) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Question is required' })
      };
    }

    // Make direct API call to OpenAI using axios
    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: question }
          ],
          max_tokens: 300
        }
      }) ;

      // Return the answer
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          answer: response.data.choices[0].message.content,
          sources: "OpenAI"
        })
      };
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      console.error('API Error Status:', apiError.response?.status);
      console.error('API Error Data:', JSON.stringify(apiError.response?.data));
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Error calling OpenAI API',
          details: apiError.message,
          status: apiError.response?.status
        })
      };
    }
  } catch (error) {
    console.error('General Error:', error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An unexpected error occurred',
        details: error.message
      })
    };
  }
};
