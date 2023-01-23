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

serve(async (req) => {
    const { url, method } = req;

    console.log(req);

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        console.log(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

        const body = await req.json();
        console.log(body[0].data);
        console.log(body[0].data.status.split(".")[1]);
        console.log(body[0].data.id);

        const updatedBody = {
            status: body[0].data.status.split(".")[1],
            updated_at: new Date(),
            recipients: body[0].data.recipients,
        };

        console.log(updatedBody);

        const { data, error } = await supabaseClient
            .from("documents")
            .update(updatedBody)
            .eq("id", body[0].data.id)
            .select();

        console.log(data);
        console.log(error);

        if (error) throw error;

        if (body[0].data.status === "document.draft") {
            return await sendPDDocument(body[0].data);
        } else {
            return new Response(JSON.stringify({ ...data }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function sendPDDocument(body) {
    console.log(body);
    const sendData = {
        message: `Hello! ${body.name} was sent from the PandaDoc API.`,
        subject: `Please check this test API document from PandaDoc: ${body.id}`,
        silent: true,
    };

    return fetch(
        `https://api.pandadoc.com/public/v1/documents/${body.id}/send`,
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization:
                    "API-Key " + "5e59f81c35e978243c5ec7dd5ed8df52c177fb2e",
            },
            body: JSON.stringify(sendData),
        }
    )
        .then((response) => response.json())
        .then(async (res) => {
            return new Response(JSON.stringify({ ...res }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        })
        .catch((error) => {
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        });
}
