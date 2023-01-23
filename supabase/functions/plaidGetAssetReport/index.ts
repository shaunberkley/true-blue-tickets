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

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const body = await req.json();

    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        {
            global: {
                headers: {
                    Authorization: req.headers.get("Authorization")!,
                },
            },
        }
    );

    console.log(body);
    console.log("about to try");
    try {
        console.log("trying");
        return await getAssetReport(body, supabaseClient);
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function getAssetReport(req: any, supabaseClient: SupabaseClient) {
    console.log("inside function");
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "PLAID-CLIENT-ID": "639e3ba655c82a0013835a87",
        "PLAID-SECRET": "897a7a9a660449c15171ba4473317d",
        "Plaid-Version": "2020-09-14",
    };

    console.log(req.asset_report_id);

    const pulledReport = await supabaseClient
        .from("reports")
        .select(`*`)
        .eq("id", req.asset_report_id);

    console.log(pulledReport);

    const reportToken = pulledReport.data
        ? pulledReport.data[0].asset_report_token
        : "";
    const request = {
        asset_report_token: reportToken,
    };

    console.log(request);

    return fetch("https://development.plaid.com/asset_report/get", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(request),
    })
        .then((response) => response.json())
        .then(async (data) => {
            console.log("fetch testing");
            console.log(data);

            const updatedReport = await supabaseClient
                .from("reports")
                .update({
                    data: data.report,
                    status: "completed",
                    updated_at: new Date(),
                })
                .eq("id", req.asset_report_id)
                .select();

            return new Response(JSON.stringify({ ...updatedReport.data }), {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
                status: 200,
            });
        });
}
