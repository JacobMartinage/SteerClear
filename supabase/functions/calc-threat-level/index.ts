import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  try {
    console.log("Received request:", req);

    // Validate method
    if (req.method !== "POST") {
      console.error("Invalid method:", req.method);
      return new Response("Only POST requests are allowed", { status: 405 });
    }

    // Parse request body
    const { data } = await req.json();
    console.log("Request body:", data);

    if (!data || typeof data !== "string" || data.trim() === "") {
      console.error("Invalid or missing 'data' in request body");
      return new Response("Invalid 'data' in request body", { status: 400 });
    }

    // Check API key
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      console.error("Missing OpenAI API key");
      return new Response("Missing OpenAI API key", { status: 500 });
    }
    console.log("OpenAI API key is present");

    // Query OpenAI
    const openai = new OpenAI({ apiKey });
    const query = `Return a score from 1-10 based on the danger level of the situation. Situation: ${data}. Only return a float value. Try to have average situations at the bottom of the scale, and extreme situations on the high end of the scale. `;
    console.log("Sending query to OpenAI:", query);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: query }],
      temperature: 0,
      max_tokens: 30,
    });

    console.log("OpenAI response:", response);

    // Parse the response
    const reply = response.choices?.[0]?.message?.content?.trim();
    const threatLevel = parseFloat(reply);

    if (isNaN(threatLevel)) {
      console.error("Invalid threat level from OpenAI:", reply);
      return new Response(`Error: Invalid threat level returned by OpenAI: ${reply}`, { status: 500 });
    }

    console.log("Threat level calculated:", threatLevel);

    // Return the threat level
    return new Response(String(threatLevel), {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

