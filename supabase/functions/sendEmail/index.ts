import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import {
    createClient,
    SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

import { sendMail, IRequestBody } from "https://deno.land/x/sendgrid/mod.ts";

interface InvitedUser {
    email: string;
    case?: {
        id: string;
        name: string;
    };
    role: {
        id: string;
        name: string;
    };
}

interface SendEmailData {
    sendEmail: InvitedUser[];
    subject: string;
    sendName: string;
    header: string;
    heading: string;
    bodyText: string;
    cta: string;
    ctaLink: string;
    templateId?: string;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eWRqZGdrcWxpeGZyYXBqaW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQwMDY0OTMsImV4cCI6MTk4OTU4MjQ5M30.fXByMAEHVdX4DfC47951HPH2IRWrUR3WBAD0obA1A0A, Content-Type",
};

const SENDGRID_API_KEY =
    "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";

serve(async (req: any) => {
    const { url, method } = req;

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const body = await req.json();
    console.log(body);

    try {
        const sgResponse = await sendEmailUtility(body);

        return new Response(JSON.stringify({ ...sgResponse }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function sendEmailUtility(sendEmailData: SendEmailData) {
    const mail: IRequestBody = {
        personalizations: sendEmailData.sendEmail.map((user: InvitedUser) => {
            console.log(user);
            return {
                to: [user],
                subject: sendEmailData.subject,
                dynamicTemplateData: {
                    sendName: sendEmailData.sendName,
                    header: sendEmailData.header,
                    heading: sendEmailData.heading,
                    bodyText: sendEmailData.bodyText,
                    cta: sendEmailData.cta,
                    ctaLink: sendEmailData.ctaLink,
                    subject: sendEmailData.subject,
                },
            };
        }),
        from: {
            email: "True Blue Tickets <notifications@truebluetickets.com>",
        },
        templateId:
            sendEmailData.templateId ?? "d-74891619c19f4c0e8eb277ce2643ce08",
    };
    console.log(mail);

    let response = await sendMail(mail, {
        apiKey: SENDGRID_API_KEY,
    });

    console.log(response);

    return response;
}
