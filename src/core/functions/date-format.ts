import { format } from "date-fns";

export default function formatDate(dateString: string, dateFormat: string) {
    return format(new Date(dateString), dateFormat);
}
