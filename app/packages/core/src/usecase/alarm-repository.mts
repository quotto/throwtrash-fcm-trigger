import { Alarm, AlarmTime } from "../entity/alarm.mjs";

export interface AlarmRepository {
    save: (alarm: Alarm) => Promise<boolean>;
    delete: (alarm: Alarm) => Promise<boolean>;
    findByDeviceToken: (deviceToken: string) => Promise<Alarm | null>;
    listByAlarmTime: (alarmTime: AlarmTime) => Promise<Alarm[]>;
}