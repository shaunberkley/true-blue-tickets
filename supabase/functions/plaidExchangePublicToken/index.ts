import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3ZyaGlybnZ1ZmN4eWdkaHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk3NzMwMjIsImV4cCI6MTk4NTM0OTAyMn0.s7wzLAAfgm0sNdIs58QzaNeN3Zu91sHS3efMRKV4bmAz, Content-Type",
};

const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID") ?? "";
const PLAID_SECRET = Deno.env.get("PLAID_SECRET") ?? "";
const PLAID_ENV = "sandbox";
const PLAID_PRODUCTS_ENV = Deno.env.get("PLAID_PRODUCTS") ?? "";
const PLAID_COUNTRY_CODES = Deno.env.get("PLAID_COUNTRY_CODES") ?? "";
const PLAID_REDIRECT_URI = Deno.env.get("PLAID_REDIRECT_URI") ?? "";

const PLAID_PRODUCTS = PLAID_PRODUCTS_ENV.split(",");

serve(async (req) => {
    const { url, method } = req;

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const body = await req.json();

    try {
        return getToken(body);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function getToken(req) {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "PLAID-CLIENT-ID": "639e3ba655c82a0013835a87",
        "PLAID-SECRET": "897a7a9a660449c15171ba4473317d",
        "Plaid-Version": "2020-09-14",
    };

    console.log(req);

    return fetch("https://development.plaid.com/item/public_token/exchange", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(req),
    })
        .then((response) => response.json())
        .then(async (data) => {
            console.log("fetch testing");
            console.log(data);

            return new Response(JSON.stringify({ ...data }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        })
        .catch((error) => {
            console.log(error);
        });
}
