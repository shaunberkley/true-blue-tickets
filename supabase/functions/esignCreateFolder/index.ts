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

interface PDFolderRes {
    name: string;
    uuid: string;
    created: string;
}

serve(async (req) => {
    const { url, method } = req;

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
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
        console.log(body);

        return createPDFolder(supabaseClient, body.caseId, body.folderName);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function createPDFolder(
    supabaseClient: SupabaseClient,
    caseId: string,
    caseName: string
) {
    return await fetch("https://api.pandadoc.com/public/v1/documents/folders", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            Authorization:
                "API-Key " + "5e59f81c35e978243c5ec7dd5ed8df52c177fb2e",
        },
        body: JSON.stringify({ name: caseName }),
    })
        .then((response) => response.json())
        .then((data) => {
            return updateSBCase(supabaseClient, data, caseId);
        })
        .catch((error) => {
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        });
}

async function updateSBCase(
    supabaseClient: SupabaseClient,
    folderRes: PDFolderRes,
    caseId: string
) {
    const { data, error } = await supabaseClient
        .from("cases")
        .update({ esign_folder_id: folderRes.uuid })
        .eq("id", caseId)
        .select();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }

    console.log(data);

    return new Response(JSON.stringify({ ...data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
    });
}
