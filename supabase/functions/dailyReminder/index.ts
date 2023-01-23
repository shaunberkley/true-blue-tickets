import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import {
    createClient,
    SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

import { sendMail, IRequestBody } from "https://deno.land/x/sendgrid/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3ZyaGlybnZ1ZmN4eWdkaHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk3NzMwMjIsImV4cCI6MTk4NTM0OTAyMn0.s7wzLAAfgm0sNdIs58QzaNeN3Zu91sHS3efMRKV4bmAz, Content-Type",
};

const SENDGRID_API_KEY =
    "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";

const oneDay: number = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

interface SendEmailData {
    sendEmail: any[];
    subject: string;
    sendName: string;
    header: string;
    heading: string;
    bodyText: string;
    cta: string;
    ctaLink: string;
}

serve(async (req) => {
    const { url, method } = req;

    console.log(req);

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    console.log(req.method);

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data, error } = await supabaseClient
            .from("cases")
            .select("id,name,documents(*),attorney(id),guardian(id)");

        if (error) throw error;

        console.log(data);

        data.forEach(async (legalCase, index) => {
            if (legalCase.documents && legalCase.documents.length) {
                await handleDocumentReminders(legalCase, supabaseClient);
            }
            index++;
            if (index === data.length) {
                console.log("done with cases foreach", index);
                return new Response(JSON.stringify("success"), {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 200,
                });
            }
        });
    } catch (error) {
        return new Response(JSON.stringify("error"), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});

async function handleDocumentReminders(
    legalCase: { id: any } & { name: any } & { documents: any } & {
        attorney: { id: any };
    } & { guardian: { id: any } },
    supabaseClient: SupabaseClient
) {
    const today = new Date();

    console.log("today is " + today);

    return legalCase.documents.forEach(
        async (
            doc: {
                status: string;
                due_date: string | number | Date;
                recipients: any[];
                name: any;
            },
            index: number
        ) => {
            if (doc.status !== "completed") {
                const docDueDate = new Date(doc.due_date);
                const daysUntilDocDue = Math.round(
                    Math.abs((today - docDueDate) / oneDay)
                );

                if (daysUntilDocDue === 7 || daysUntilDocDue === 14) {
                    if (legalCase?.attorney?.id) {
                        await addDocReminderNotification(
                            legalCase,
                            legalCase.attorney.id,
                            daysUntilDocDue,
                            doc,
                            supabaseClient
                        );
                    }

                    if (legalCase.guardian.id) {
                        return await addDocReminderNotification(
                            legalCase,
                            legalCase.guardian.id,
                            daysUntilDocDue,
                            doc,
                            supabaseClient
                        );
                    }

                    await sendEmailUtility({
                        sendEmail: doc.recipients.map((recipient) => {
                            return {
                                email: recipient.email,
                                name: `${recipient.first_name} ${recipient.last_name}`,
                            };
                        }),
                        subject: `Action required: ${doc.name} is due in ${daysUntilDocDue} days`,
                        sendName: "",
                        header: `${doc.name} is due in ${daysUntilDocDue} days`,
                        heading: `Action required for ${legalCase.name}:`,
                        bodyText: `${doc.name} has not been signed by all parties. Please complete it within the next ${daysUntilDocDue} days.`,
                        cta: "View Case",
                        ctaLink: `https://guardians-hub.vercel.app/cases/${legalCase.id}/forms`,
                    });
                } else return;
            }
        }
    );
}

async function addDocReminderNotification(
    legalCase: { id: any } & { name: any } & { documents: any } & {
        attorney: { id: any };
    } & { guardian: { id: any } },
    profileId: any,
    daysUntilDocDue: number,
    doc: {
        status?: string;
        due_date?: string | number | Date;
        recipients?: any[];
        name: any;
    },
    supabaseClient: SupabaseClient<any, "public", any>
) {
    const notification = {
        case: legalCase.id,
        message: `${doc.name} for ${legalCase.name} is due in ${daysUntilDocDue} days.`,
        profile: profileId,
        action: "View",
        router_link: `/cases/${legalCase.id}/forms`,
    };

    console.log(notification);

    const { data, error } = await supabaseClient
        .from("notifications")
        .insert(notification)
        .select();

    return data;
}

async function sendEmailUtility(sendEmailData: SendEmailData) {
    const mail: IRequestBody = {
        personalizations: sendEmailData.sendEmail.map((user: any) => {
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
            email: "Guardians Hub Notifications <notifications@guardianshub.com>",
        },
        templateId: "d-74891619c19f4c0e8eb277ce2643ce08",
    };

    let response = await sendMail(mail, {
        apiKey: SENDGRID_API_KEY,
    });

    return response;
}
