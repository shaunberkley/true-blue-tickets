export interface SendEmailItem {
    email: string;
    name: string;
}

export interface SendEmailRequest {
    sendEmail: SendEmailItem[];
    subject: string;
    sendName: string;
    header: string;
    heading: string;
    bodyText: string;
    cta: string;
    ctaLink: string;
}
