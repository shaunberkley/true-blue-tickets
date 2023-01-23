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

type EsignDocumentStatus = "Completed" | "Sent" | "Ready for signature";

interface SBDocument {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    status: EsignDocumentStatus;
    case: string;
}

interface EsignRecipient {
    email: string;
    first_name: string;
    last_name: string;
    role: "Guardian" | "Physician" | "Attorney" | "Admin";
}

interface EsignDocument {
    name: string;
    template_uuid: string;
    folder_uuid: string;
    recipients: EsignRecipient[];
    fields?: any;
    tokens?: any;
    metadata?: any;
    caseId: string;
}

serve(async (req) => {
    const { url, method } = req;

    console.log(req);

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

        return createPDDocument(supabaseClient, body.document, body.caseId);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function createPDDocument(
    supabaseClient,
    document: EsignDocument,
    caseId: string
) {
    return fetch("https://api.pandadoc.com/public/v1/documents", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            Authorization:
                "API-Key " + "5e59f81c35e978243c5ec7dd5ed8df52c177fb2e",
        },
        body: JSON.stringify(document),
    })
        .then((response) => response.json())
        .then(async (data) => {
            const body = {
                id: data.id,
                name: data.name,
                status: "uploaded",
                case: caseId,
                due_date: document.due_date,
            };

            return createSBDocument(supabaseClient, body);
        })
        .catch((error) => {
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            });
        });
}

async function createSBDocument(
    supabaseClient: SupabaseClient,
    document: SBDocument
) {
    const { data, error } = await supabaseClient
        .from("documents")
        .insert(document)
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
