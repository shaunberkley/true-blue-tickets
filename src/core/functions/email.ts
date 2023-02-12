import type { SendEmailRequest } from "../types/email.model";

export async function sendEmail(
    accessToken: string,
    sendEmailRequest: SendEmailRequest
) {
    console.log(sendEmailRequest);
    return fetch(
        "https://pyydjdgkqlixfrapjiou.functions.supabase.co/sendEmail",
        {
            method: "post",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(sendEmailRequest),
        }
    )
        .then((res) => {
            // a non-200 response code
            if (!res.ok) {
                // create error instance with HTTP status text
                const error = new Error(res.statusText);
                // error.json = res.json();
                throw error;
            }
            console.log(res.json());
            return res.json();
        })
        .then(async (json) => {
            console.log(json);
        })
        .catch((err) => {
            // In case a custom JSON error response was provided
            if (err.json) {
                console.log(err.json);
                return err.json;
            }
        });
}
