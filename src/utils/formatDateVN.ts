import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh")
export const formatDateVN = (date: string | Date | number) => {
    return dayjs(date).tz().format('YYYY-MM-DD HH:mm:ss')
}

