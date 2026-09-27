// @ts-ignore Remote Deno imports are resolved by the Supabase Edge Function runtime.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore Remote Deno imports are resolved by the Supabase Edge Function runtime.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  profile?: {
    role?: string;
    crops?: string[];
    land_size_hectares?: number;
    location?: { district?: string; state?: string };
    language?: string;
  };
  query?: string;
}

const VALID_ROLES = ["farmer", "tool_lender", "job_seeker", "storage_owner"];

serve(async (req: Request) => {
  // 1. Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Validate Authorization Header & Authenticate User via Supabase Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header. Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Authenticate user using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication token." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse & Validate Input Body
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input Validation & Sanitization
    const rawQuery = body.query ?? "";
    if (typeof rawQuery !== "string") {
      return new Response(
        JSON.stringify({ error: "Query parameter must be a string." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const cleanQuery = rawQuery.trim().slice(0, 500); // Limit query length to 500 chars

    const role = body.profile?.role && VALID_ROLES.includes(body.profile.role)
      ? body.profile.role
      : "farmer";

    const crops = Array.isArray(body.profile?.crops)
      ? body.profile.crops
          .filter((c): c is string => typeof c === "string")
          .map((c) => c.trim().slice(0, 50))
          .slice(0, 20)
      : [];

    const rawLand = body.profile?.land_size_hectares;
    const landSize = typeof rawLand === "number" && !isNaN(rawLand) && rawLand >= 0
      ? rawLand
      : null;

    const district = typeof body.profile?.location?.district === "string"
      ? body.profile.location.district.trim().slice(0, 100)
      : "";
    const state = typeof body.profile?.location?.state === "string"
      ? body.profile.location.state.trim().slice(0, 100)
      : "India";

    const language = typeof body.profile?.language === "string"
      ? body.profile.language.trim().slice(0, 50)
      : "English";

    // 4. Fetch Trusted Government Schemes Data Directly from Database Server-Side
    const { data: trustedSchemes, error: dbError } = await supabase
      .from("government_schemes")
      .select("id, title, category, description, benefits, eligibility_criteria, official_link, official_apply_url, application_method, application_deadline, source_updated_at, verification_status");

    if (dbError) {
      return new Response(
        JSON.stringify({ error: `Database query failed: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Verify Gemini API Key
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY environment variable is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Build Grounded Prompt with Strict Isolation
    const systemPrompt = `You are Kisan AI, an expert agricultural scheme and farming advisor for Indian rural farmers.
CRITICAL INSTRUCTIONS:
- Only discuss schemes supplied in the verified database context below.
- Never invent scheme names, benefits, eligibility requirements, deadlines, or URLs.
- Never generate application URLs or portal web links in your output. Official application links are rendered separately by verified UI components.
- If information is absent or unknown, explicitly state that it is not specified in the official record.
- Do not make definitive claims of legal eligibility. Always advise the farmer that official government authorities determine final approval.
- Format responses strictly in simple, clear JSON using clear language (${language}).`;

    const trustedContextString = JSON.stringify(trustedSchemes || [], null, 2);

    const userContent = `
--- TRUSTED DATABASE SCHEMES CONTEXT ---
${trustedContextString}

--- USER PROFILE (UNTRUSTED DATA) ---
Role: ${role}
Crops: ${crops.length > 0 ? crops.join(", ") : "General crops"}
Land Size: ${landSize !== null ? landSize + " hectares" : "Not specified"}
Location: ${district ? district + ", " : ""}${state}
Preferred Language: ${language}

--- USER QUERY (UNTRUSTED DATA) ---
"${cleanQuery || "What government schemes and subsidies am I eligible for?"}"

Respond strictly with valid JSON using this structure:
{
  "recommendations": [
    {
      "scheme_title": "Exact Title from Trusted Context",
      "eligibility_match": "High" | "Medium" | "Low",
      "reason": "Clear explanation based on profile"
    }
  ],
  "advice": "Clear advice for the farmer",
  "next_steps": ["Step 1", "Step 2"]
}
`;

    // 7. Invoke Gemini API (gemini-1.5-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userContent}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API Error: ${errorText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(responseText || JSON.stringify({ advice: "No response generated." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
