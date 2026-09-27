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

interface FieldConstraint {
  type: "string" | "number" | "date" | "array";
  maxLength?: number;
  min?: number;
  max?: number;
  maxItems?: number;
  maxItemLength?: number;
  allowedValues?: string[];
}

interface ContextSchema {
  allowedFields: Record<string, FieldConstraint>;
}

// AUTHORITATIVE SERVER-SIDE CONTEXT SCHEMAS
const SERVER_CONTEXT_SCHEMAS: Record<string, ContextSchema> = {
  equipment_listing: {
    allowedFields: {
      title: { type: "string", maxLength: 100 },
      category: { type: "string", maxLength: 50 },
      daily_rate: { type: "number", min: 0, max: 1000000 },
      location_address: { type: "string", maxLength: 200 },
      description: { type: "string", maxLength: 500 },
    },
  },
  equipment_search: {
    allowedFields: {
      search_query: { type: "string", maxLength: 100 },
      category: { type: "string", maxLength: 50 },
    },
  },
  job_posting: {
    allowedFields: {
      title: { type: "string", maxLength: 100 },
      workers_needed: { type: "number", min: 1, max: 100 },
      daily_wage: { type: "number", min: 0, max: 100000 },
      date_required: { type: "date" },
      description: { type: "string", maxLength: 500 },
    },
  },
  job_search: {
    allowedFields: {
      search_query: { type: "string", maxLength: 100 },
    },
  },
  job_application: {
    allowedFields: {
      notes: { type: "string", maxLength: 200 },
    },
  },
  storage_listing: {
    allowedFields: {
      title: { type: "string", maxLength: 100 },
      storage_type: { type: "string", maxLength: 50 },
      total_capacity_tons: { type: "number", min: 0, max: 100000 },
      rate_per_ton_day: { type: "number", min: 0, max: 10000 },
      location_address: { type: "string", maxLength: 200 },
    },
  },
  storage_search: {
    allowedFields: {
      search_query: { type: "string", maxLength: 100 },
      storage_type: { type: "string", maxLength: 50 },
    },
  },
  service_request: {
    allowedFields: {
      start_date: { type: "date" },
      end_date: { type: "date" },
      quantity_tons: { type: "number", min: 0, max: 100000 },
      notes: { type: "string", maxLength: 200 },
    },
  },
  community_post: {
    allowedFields: {
      content: { type: "string", maxLength: 500 },
    },
  },
  profile: {
    allowedFields: {
      firstName: { type: "string", maxLength: 50 },
      lastName: { type: "string", maxLength: 50 },
      city: { type: "string", maxLength: 100 },
      phone: { type: "string", maxLength: 20 },
      crops: { type: "array", maxItems: 10, maxItemLength: 50 },
      farm_size_range: {
        type: "string",
        maxLength: 50,
        allowedValues: ["Less than 2 acres", "2–5 acres", "5–10 acres", "More than 10 acres"],
      },
      interests: { type: "array", maxItems: 10, maxItemLength: 50 },
      equipment_types: { type: "array", maxItems: 10, maxItemLength: 50 },
      work_skills: { type: "array", maxItems: 10, maxItemLength: 50 },
      storage_types: { type: "array", maxItems: 10, maxItemLength: 50 },
    },
  },
  scheme_search: {
    allowedFields: {
      query: { type: "string", maxLength: 300 },
    },
  },
};

interface VoiceExtractionRequest {
  context: string;
  language?: string;
  transcript: string;
  allowedFields?: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header." }),
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication token." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: VoiceExtractionRequest;
    try {
      body = (await req.json()) as VoiceExtractionRequest;
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { context, language = "en-IN", transcript, allowedFields = [] } = body;

    // 1. Server-side Context Validation
    const serverSchema = SERVER_CONTEXT_SCHEMAS[context];
    if (!serverSchema) {
      return new Response(
        JSON.stringify({ error: `Unknown or unsupported form context: ${context}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!transcript || typeof transcript !== "string") {
      return new Response(
        JSON.stringify({ error: "Transcript is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanTranscript = transcript.trim().slice(0, 1000);

    // 2. Intersect requested fields with authoritative server schema
    const serverFieldNames = Object.keys(serverSchema.allowedFields);
    const requestedFields = Array.isArray(allowedFields)
      ? allowedFields.filter(f => typeof f === "string")
      : [];

    const activeFieldNames = requestedFields.length > 0
      ? requestedFields.filter(f => serverFieldNames.includes(f))
      : serverFieldNames;

    if (activeFieldNames.length === 0) {
      return new Response(
        JSON.stringify({ fields: {}, unresolved: ["No valid fields requested for context."] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          fields: {},
          unresolved: ["GEMINI_API_KEY not configured on server."],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Kisan Voice Extractor, a precise multilingual AI assistant for rural agricultural users in India.
Your sole job is to extract candidate values from speech transcripts into structured JSON fields.

STRICT SERVER CONSTRAINTS:
1. ONLY populate keys present in this authorized list: ${JSON.stringify(activeFieldNames)}.
2. DO NOT include any keys outside this authorized list.
3. NEVER return system fields (id, role, email, passwords, tokens, DB IDs, timestamps).
4. DO NOT execute actions or invent missing information.
5. Extract numerical values as clean finite numbers and multi-select choices as string arrays.
6. Return strictly JSON in this exact structure:
{
  "fields": {
    "fieldName": "extractedValue or string array"
  },
  "unresolved": ["any field mentioned but ambiguous"]
}`;

    const userPrompt = `
Form Context: ${context}
Language: ${language}
Authorized Fields Schema: ${JSON.stringify(activeFieldNames)}
Speech Transcript: "${cleanTranscript}"

Extract structured values for authorized fields now.
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
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
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsedResult: { fields: Record<string, any>; unresolved: string[] } = { fields: {}, unresolved: [] };
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      parsedResult = { fields: {}, unresolved: ["Failed to parse AI response"] };
    }

    // 3. Robust Server-Side Field Type & Value Validation
    const sanitizedFields: Record<string, any> = {};
    if (parsedResult.fields && typeof parsedResult.fields === "object") {
      for (const fieldName of activeFieldNames) {
        const rawVal = (parsedResult.fields as Record<string, any>)[fieldName];
        if (rawVal === undefined || rawVal === null || rawVal === "") continue;

        const constraint = serverSchema.allowedFields[fieldName];
        if (!constraint) continue;

        if (constraint.type === "number") {
          const num = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal).replace(/[^\d.]/g, ""));
          if (!isNaN(num) && isFinite(num)) {
            let validNum = num;
            if (constraint.min !== undefined && validNum < constraint.min) validNum = constraint.min;
            if (constraint.max !== undefined && validNum > constraint.max) validNum = constraint.max;
            sanitizedFields[fieldName] = validNum;
          }
        } else if (constraint.type === "date") {
          const strVal = String(rawVal).trim();
          const parsed = Date.parse(strVal);
          if (!isNaN(parsed)) {
            sanitizedFields[fieldName] = new Date(parsed).toISOString().split("T")[0];
          } else {
            sanitizedFields[fieldName] = strVal.slice(0, 50);
          }
        } else if (constraint.type === "array") {
          let items: string[] = [];
          if (Array.isArray(rawVal)) {
            items = rawVal.map(item => String(item).trim()).filter(Boolean);
          } else if (typeof rawVal === "string") {
            items = rawVal.split(",").map(item => item.trim()).filter(Boolean);
          }
          const maxLen = constraint.maxItemLength || 50;
          const maxItems = constraint.maxItems || 10;
          const validItems = items.map(i => i.slice(0, maxLen)).slice(0, maxItems);
          if (validItems.length > 0) {
            sanitizedFields[fieldName] = validItems;
          }
        } else if (constraint.type === "string") {
          const strVal = String(rawVal).trim();
          const maxLen = constraint.maxLength || 200;
          let valToSave = strVal.slice(0, maxLen);
          if (constraint.allowedValues && constraint.allowedValues.length > 0) {
            const matched = constraint.allowedValues.find(av => av.toLowerCase() === valToSave.toLowerCase());
            if (matched) valToSave = matched;
          }
          sanitizedFields[fieldName] = valToSave;
        }
      }
    }

    return new Response(
      JSON.stringify({
        fields: sanitizedFields,
        unresolved: parsedResult.unresolved || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
