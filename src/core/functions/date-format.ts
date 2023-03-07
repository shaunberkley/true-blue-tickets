import { format, addDays } from "date-fns";

export function formatDate(dateString: string, dateFormat: string) {
    return format(new Date(dateString), dateFormat);
}

export function addDaysToDate(dateString: string, numberDays: number) {
    return addDays(new Date(dateString), numberDays);
}
