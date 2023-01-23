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

let caseId = "";

serve(async (req: Request) => {
    const { url, method } = req;

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const body = await req.json();
    console.log(body);
    caseId = body.caseId;

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

    try {
        return await createAssetReport(body, supabaseClient);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function createAssetReport(req: any, supabaseClient: SupabaseClient) {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "PLAID-CLIENT-ID": "639e3ba655c82a0013835a87",
        "PLAID-SECRET": "897a7a9a660449c15171ba4473317d",
        "Plaid-Version": "2020-09-14",
    };

    const request = {
        access_tokens: req.access_tokens,
        days_requested: 365,
        options: {
            webhook:
                "https://gtcvrhirnvufcxygdhyr.functions.supabase.co/plaidGetAssetReport",
        },
    };

    console.log(request);

    return fetch("https://development.plaid.com/asset_report/create", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(request),
    })
        .then((response) => response.json())
        .then(async (createData) => {
            console.log("fetch testing");
            console.log(createData);

            try {
                const body = createData;
                console.log(body);

                const report = {
                    id: body.asset_report_id,
                    case: caseId,
                    asset_report_token: body.asset_report_token,
                    status: "pending",
                };

                console.log(report);

                const insertedReport = await supabaseClient
                    .from("reports")
                    .insert(report)
                    .select();

                console.log(insertedReport?.error);

                return new Response(
                    JSON.stringify({ ...insertedReport.data }),
                    {
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                        status: 200,
                    }
                );
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                });
            }
        })
        .catch((error) => {
            console.log(error);
        });
}
