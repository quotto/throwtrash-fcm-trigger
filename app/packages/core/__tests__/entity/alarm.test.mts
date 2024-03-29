import { describe, test, expect } from '@jest/globals';
import { Alarm, AlarmTime } from "../../src/entity/alarm.mjs";
import { Device } from "../../src/entity/device.mjs";
import { User } from "../../src/entity/user.mjs";

describe('Alarm', () => {
    test('正常にAlarmインスタンスが生成される', () => {
        const device = new Device('deviceToken', 'ios');
        const user = new User('userId');
        const alarm_time = new AlarmTime({hour: 12, minute:0});
        const alarm = new Alarm(device, alarm_time, user);
        expect(alarm.getDevice()).toEqual(device);
        expect(alarm.getAlarmTime()).toEqual(alarm_time);
        expect(alarm.getUser()).toEqual(user);
    });
});