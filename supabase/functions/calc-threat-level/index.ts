import { serve } from 'https://deno.land/std@0.182.0/http/server.ts'
import OpenAI from 'https://esm.sh/openai@4.0.0'

serve(async (req) => {
  try {
    // Ensure it's a POST request
    if (req.method !== 'POST') {
      return new Response('Only POST requests allowed', { status: 405 });
    }

    // Parse request body
    const { data } = await req.json();

    // Ensure 'data' is provided
    if (!data) {
      return new Response('Missing "data" in request body', { status: 400 });
    }

    // Append data to the query
    const query = `Return a score of 1-10 based on the danger level of the situation, 10 being a violent crime, 1 being the perfect situation. Return the score as a number with two decimals. Low visibility might be a 3 or 4 for reference. Rank it based on potential threat to the people involved/ how uncomfortable someone would be walking by. Only return the score value as a double, and provide no other information. Here is the situation: ${data}`;

    // Get API key from environment
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response('Missing OpenAI API key', { status: 500 });
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: query }],
      model: 'gpt-4o-mini',
      stream: false,
    });

    // Extract and return the response
    const reply = response.choices[0].message.content.trim();

    return new Response(reply, {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});
