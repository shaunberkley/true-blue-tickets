import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import {
    createClient,
    SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

interface PDForm {
    id: string;
    name: string;
    date_created: string;
    date_modified: string;
    version: string;
}

interface EsignForm {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3ZyaGlybnZ1ZmN4eWdkaHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk3NzMwMjIsImV4cCI6MTk4NTM0OTAyMn0.s7wzLAAfgm0sNdIs58QzaNeN3Zu91sHS3efMRKV4bmAz, Content-Type",
};

async function getTemplates(supabaseClient: SupabaseClient) {
    return fetch("https://api.pandadoc.com/public/v1/templates", {
        method: "GET",
        headers: {
            "content-type": "application/json",
            Authorization:
                "API-Key " + "5e59f81c35e978243c5ec7dd5ed8df52c177fb2e",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("data");
            console.log(data);
            return updateSBEsignForms(supabaseClient, data.results);
        })
        .catch((error) => {
            console.log(error);
        });
}

async function updateSBEsignForms(
    supabaseClient: SupabaseClient,
    forms: PDForm[]
) {
    const formatedForms: EsignForm[] = forms.map((form: PDForm) => {
        return {
            id: form.id,
            name: form.name,
            created_at: form.date_created,
            updated_at: form.date_modified,
            last_synced: new Date(),
        };
    });
    console.log("formatted forms");
    console.log(formatedForms);
    const { data, error } = await supabaseClient
        .from("esign_forms")
        .upsert(formatedForms)
        .select();
    if (error) throw error;

    console.log("new dataa");
    console.log(data);

    return new Response(JSON.stringify({ ...data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
    });
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

        return getTemplates(supabaseClient);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
