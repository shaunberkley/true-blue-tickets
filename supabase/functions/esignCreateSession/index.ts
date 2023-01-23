import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3ZyaGlybnZ1ZmN4eWdkaHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk3NzMwMjIsImV4cCI6MTk4NTM0OTAyMn0.s7wzLAAfgm0sNdIs58QzaNeN3Zu91sHS3efMRKV4bmAz, Content-Type",
};

serve(async (req) => {
    const { url, method } = req;

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const body = await req.json();

    console.log(body);

    try {
        return createSession(body);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function createSession(req) {
    const headers = {
        "content-type": "application/json",
        Authorization: "API-Key " + "5e59f81c35e978243c5ec7dd5ed8df52c177fb2e",
    };

    const request = {
        recipient: req.recipient,
        lifetime: 300000,
    };

    console.log(request);

    return fetch(
        `https://api.pandadoc.com/public/v1/documents/${req.id}/session`,
        {
            method: "POST",
            headers: headers,
            body: JSON.stringify(request),
        }
    )
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
