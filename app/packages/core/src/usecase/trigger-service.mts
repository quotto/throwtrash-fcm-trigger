import { MessageSender } from "./message-sender.mjs";
import { AlarmRepository} from "../usecase/alarm-repository.mjs";
import { TrashScheduleRepository } from "./trash-schedule-repository.mjs";
import { Alarm } from "../entity/alarm.mjs";
import { AlarmTime } from "../entity/alarm-time.mjs";
import { DeviceMessage } from "../entity/device-message.mjs";
import { DBAdapter, TextCreator, TrashSchedule, TrashScheduleService } from "trash-common";

const MAX_SEND_DEVICES = 500;
class DBAdapterImple implements DBAdapter {
  getUserIDByAccessToken(access_token: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getTrashSchedule(user_id: string): Promise<TrashSchedule> {
    throw new Error("Method not implemented.");
  }
}
const text_creator = new TextCreator("ja-JP");
const trash_schedule_service = new TrashScheduleService("Asia/Tokyo", text_creator,new DBAdapterImple());

export const sendMessage = async (
  trash_schedule_repository: TrashScheduleRepository,
  alarm_repository: AlarmRepository ,
  notification_sender: MessageSender,alarm_time: AlarmTime
) => {
  const target_devices = await alarm_repository.listByAlarmTime(alarm_time);
  if(target_devices.length == 0) {
    console.warn("該当するデバイスはありませんでした");
    return;
  }
  const all_send_tasks: Promise<any>[] = [];

  while(target_devices.length > 0) {
    const send_target_devices = target_devices.splice(0, MAX_SEND_DEVICES);

    const device_messages: DeviceMessage[] = []
    send_target_devices.forEach(async (alarm: Alarm) => {
      const trash_schedule = await trash_schedule_repository.findTrashScheduleByUserId(alarm.getUser().getId());
      if(!trash_schedule) {
        console.warn(`ゴミ捨てスケジュールが見つかりませんでした - ${alarm.getUser().getId()}`);
        return;
      }

      const today = new Date();
      console.log(today.toISOString())
      const enable_trashes: string[] = [];
      trash_schedule.trashData.forEach((trash_data) => {
        const trash_type = trash_schedule_service.getEnableTrashData(trash_data, today);
        if(trash_type) {
          console.log(trash_type)
          enable_trashes.push(trash_type.name)
        }
      });
      const message = enable_trashes.length > 0 ? enable_trashes.join(",") : "今日出せるゴミはありません";

      device_messages.push(new DeviceMessage(alarm.getDevice(), message));
    });

    all_send_tasks.push(notification_sender.sendToDevices(device_messages));
  }

  const result = await Promise.all(all_send_tasks);
  result.forEach((notification_result, index) => {
    if(notification_result.status === "FAILURE") {
      console.error(`メッセージの送信でエラーが発生しました - 対象範囲: ${index * MAX_SEND_DEVICES + 1} - ${index * MAX_SEND_DEVICES + MAX_SEND_DEVICES}`);
      console.error(notification_result.errorMessages);
    }
  });
}