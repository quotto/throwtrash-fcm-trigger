import { Alarm, AlarmTime } from "../domain/alarm.mjs";
import { Device } from "../domain/device.mjs";
import { User } from "../domain/user.mjs";
import { AlarmRepositoryInterface } from "./alarm-repository-interface.mjs";
import { AlarmTriggerConnectorInterface } from "./alarm-trigger-connector-interface.mjs";

export class RegisterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RegisterError";
    }
}

export class UpdateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UpdateError";
    }
}

export class DeleteError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DeleteError";
    }
}

export const registerAlarm = async (alarmRepository: AlarmRepositoryInterface, alarmTriggerConnector: AlarmTriggerConnectorInterface,deviceToken: string, alarmTime: AlarmTime, userId: string, platform: string) => {
    const newAlarm = new Alarm(new Device(deviceToken, platform), alarmTime,new User(userId))
    if(await alarmTriggerConnector.findByTime(newAlarm.getAlarmTime()) === null) {
        if(!await alarmTriggerConnector.create(newAlarm.getAlarmTime())) {
            throw new RegisterError("アラームの作成に失敗しました");
        }
    }
    if(!await alarmRepository.create(newAlarm)) {
        throw new RegisterError("アラームの登録に失敗しました");
    }
}

export const updateAlarm = async (alarmRepository: AlarmRepositoryInterface, alarmTriggerConnector: AlarmTriggerConnectorInterface,deviceToken: string, alarmTime: AlarmTime) => {
    const alarm = await alarmRepository.findByDeviceToken(deviceToken);
    if(alarm) {
        const updatedAlarm = alarm.updateTime(alarmTime);
        if(await alarmTriggerConnector.findByTime(updatedAlarm.getAlarmTime()) === null) {
            if(!await alarmTriggerConnector.create(updatedAlarm.getAlarmTime())) {
                throw new UpdateError("アラームトリガーの作成に失敗しました");
            }
        }
        if(!await alarmRepository.update(updatedAlarm)) {
            throw new UpdateError("アラームの更新に失敗しました");
        }
    } else {
        throw new UpdateError("登録済みのアラームが見つかりませんでした");
    }
}

export const deleteAlarm = async (alarmRepository: AlarmRepositoryInterface, deviceToken: string) => {
    const alarm = await alarmRepository.findByDeviceToken(deviceToken);
    if(alarm != null) {
        if(!await alarmRepository.delete(alarm)) {
            throw new DeleteError("アラームの削除に失敗しました");
        }
    } else {
        throw new DeleteError("登録済みのアラームが見つかりませんでした");
    }

}