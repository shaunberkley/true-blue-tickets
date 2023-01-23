import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import {
    createClient,
    SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3ZyaGlybnZ1ZmN4eWdkaHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk3NzMwMjIsImV4cCI6MTk4NTM0OTAyMn0.s7wzLAAfgm0sNdIs58QzaNeN3Zu91sHS3efMRKV4bmAz, Content-Type",
};

const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID") ?? "";
const PLAID_SECRET = Deno.env.get("PLAID_SECRET") ?? "";

serve(async (req) => {
    const { url, method } = req;

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
            global: {
                headers: {
                    Authorization: req.headers.get("Authorization")!,
                },
            },
        }
    );

    const body = await req.json();

    let requestBody = {
        user: body.user,
        country_codes: ["US"],
        language: "en",
        client_name: "Guardians Hub",
        products: ["auth", "transactions", "assets"],
        webhook: "https://webhook.sample.com",
        update: { account_selection_enabled: true },
        access_token: "",
    };

    const { data, error } = await supabaseClient
        .from("financial_items")
        .select()
        .eq("id", body.item_id)
        .limit(1)
        .single();

    requestBody.access_token = data.access_token;

    try {
        return await createLinkToken(requestBody);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

function createLinkToken(req) {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "PLAID-CLIENT-ID": "639e3ba655c82a0013835a87",
        "PLAID-SECRET": "897a7a9a660449c15171ba4473317d",
        "Plaid-Version": "2020-09-14",
    };

    console.log(req);

    return fetch("https://development.plaid.com/link/token/create", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(req),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("fetch testing");
            console.log(data);

            return new Response(JSON.stringify({ ...data }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        })
        .catch((error) => {
            console.log(error);
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        });
}
