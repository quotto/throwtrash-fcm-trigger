import { AlarmTime } from "../entity/alarm-time.mjs";

export interface AlarmScheduler {
    create(alarm_time: AlarmTime): Promise<boolean>;
    findByTime(alarm_time: AlarmTime): Promise<string | null>;
}