import { describe, test, expect, jest } from '@jest/globals';
import { Alarm, AlarmTime } from "../../src/entity/alarm.mjs";
import { Device } from "../../src/entity/device.mjs";
import { User } from "../../src/entity/user.mjs";
import { AlarmRepository } from "../../src/usecase/alarm-repository.mjs";
import { DeleteError, RegisterError, UpdateError, deleteAlarm, registerAlarm, updateAlarm } from "../../src/usecase/alarm-service.mjs";
import { AlarmScheduler } from "../../src/usecase/alarm-scheduler.mjs";

describe('AlarmService', () => {
    describe('アラームの登録', () => {
        test('正常に登録できること-アラームトリガーが存在しない場合は新規に作成する', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(null) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue(null) as any,
                create: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmScheduler>;

            await registerAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 7,minute: 0}), 'aaaaaa', 'ios');

            expect(mockAlarmTriggerConnector.findByTime).toHaveBeenCalledWith(new AlarmTime({hour: 7, minute: 0}));
            expect(mockAlarmTriggerConnector.create).toHaveBeenCalledWith(new AlarmTime({hour: 7, minute: 0}))
            expect(mockAlarmRepository.save).toHaveBeenCalledWith(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 7,minute: 0}), new User('aaaaaa')));
        });
        test('正常に登録できること-アラームトリガーが存在する場合は新規に作成しない', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(null) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue('alarm-trigger-0700') as any,
                create: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmScheduler>;

            await registerAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 7,minute: 0}), 'aaaaaa', 'ios');

            expect(mockAlarmTriggerConnector.create).not.toHaveBeenCalled();
            expect(mockAlarmRepository.save).toHaveBeenCalledWith(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 7,minute: 0}), new User('aaaaaa')));
        });
        test('アラームトリガーの作成に失敗した場合、RegisterErrorが発生すること', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(null) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue(null) as any,
                create: jest.fn().mockReturnValue(false) as any
            }) as jest.Mocked<AlarmScheduler>;

            await expect(async () => {
                await registerAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 7,minute:0}), 'aaaaaa', 'ios');
            }).rejects.toThrow(RegisterError);
            expect(mockAlarmRepository.save).not.toHaveBeenCalled();
        });
        test('アラームの登録に失敗した場合、RegisterErrorが発生すること', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(false) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(null) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue(null) as any,
                create: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmScheduler>;

            await expect(async () => {
                await registerAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 7,minute:0}), 'aaaaaa', 'ios');
            }).rejects.toThrow(RegisterError);
            expect(mockAlarmTriggerConnector.create).toHaveBeenCalledWith(new AlarmTime({hour: 7, minute: 0}));
        });
    });
    describe('アラームの更新', () => {
        test('正常に更新できること-アラームトリガーが存在しない場合は新規に作成する', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 7,minute:0}), new User('aaaaaa'))) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue(null) as any,
                create: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmScheduler>;

            await updateAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 6,minute:0}));

            expect(mockAlarmTriggerConnector.create).toHaveBeenCalledWith(new AlarmTime({hour: 6, minute: 0}))
            expect(mockAlarmRepository.save).toHaveBeenCalledWith(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 6,minute:0}), new User('aaaaaa')));
        });
        test("正常に更新できること-アラームトリガーが存在する場合は新規に作成しない", async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 6,minute:0}), new User('aaaaaa'))) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue('alarm-trigger-0600') as any,
                create: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmScheduler>;

            await updateAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 6,minute:0}));

            expect(mockAlarmRepository.findByDeviceToken).toHaveBeenCalledWith('deviceToken');
            expect(mockAlarmTriggerConnector.findByTime).toHaveBeenCalledWith(new AlarmTime({hour: 6,minute:0}));
            expect(mockAlarmTriggerConnector.create).not.toHaveBeenCalled();
            expect(mockAlarmRepository.save).toHaveBeenCalledWith(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 6,minute:0}), new User('aaaaaa')));
        });
        test('アラームトリガーの作成に失敗した場合、UpdateErrorが発生すること', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 6,minute:0}), new User('aaaaaa'))) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue(null) as any,
                create: jest.fn().mockReturnValue(false) as any
            }) as jest.Mocked<AlarmScheduler>;

            await expect(async () => {
                await updateAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 6,minute:0}));
            }).rejects.toThrow(UpdateError);
            expect(mockAlarmRepository.save).not.toHaveBeenCalled();
        });
        test('アラームの更新に失敗した場合、UpdateErrorが発生すること', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(false) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 7,minute:0}), new User('aaaaaa'))) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue('alarm-trigger-0600') as any,
                create: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmScheduler>;

            await expect(async () => {
                await updateAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 6,minute:0}));
            }).rejects.toThrow(UpdateError);
            expect(mockAlarmTriggerConnector.create).not.toHaveBeenCalled();
        });
        test('登録済みのアラームが見つからない場合、UpdateErrorが発生すること', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(null) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            const mockAlarmTriggerConnector: AlarmScheduler = jest.mocked<AlarmScheduler>({
                findByTime: jest.fn().mockReturnValue('alarm-trigger-0600') as any,
                create: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmScheduler>;

            await expect(async () => {
                await updateAlarm(mockAlarmRepository, mockAlarmTriggerConnector, 'deviceToken', new AlarmTime({hour: 6,minute:0}));
            }).rejects.toThrow(UpdateError);
            expect(mockAlarmTriggerConnector.create).not.toHaveBeenCalled();
            expect(mockAlarmRepository.save).not.toHaveBeenCalled();
        });
     });
     describe('アラームの削除', () => {
        test('正常に削除できること', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 7,minute:0}), new User('aaaaaa'))) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            await deleteAlarm(mockAlarmRepository, 'deviceToken');

            expect(mockAlarmRepository.findByDeviceToken).toHaveBeenCalledWith('deviceToken');
            expect(mockAlarmRepository.delete).toHaveBeenCalledWith(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 7,minute:0}), new User('aaaaaa')));
        });
        test('登録済みのアラームが見つからない場合、DeleteErrorが発生すること', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(null) as any,
                delete: jest.fn().mockReturnValue(true) as any
            }) as jest.Mocked<AlarmRepository>;

            await expect(async () => {
                await deleteAlarm(mockAlarmRepository, 'deviceToken');
            }).rejects.toThrow(DeleteError);
            expect(mockAlarmRepository.delete).not.toHaveBeenCalled();
        });
        test('アラームの削除に失敗した場合、DeleteErrorが発生すること', async () => {
            const mockAlarmRepository: AlarmRepository = jest.mocked<AlarmRepository>({
                save: jest.fn().mockReturnValue(true) as any,
                listByAlarmTime: jest.fn().mockReturnValue([]) as any,
                findByDeviceToken: jest.fn().mockReturnValue(new Alarm(new Device('deviceToken','ios'), new AlarmTime({hour: 7,minute:0}), new User('aaaaaa'))) as any,
                delete: jest.fn().mockReturnValue(false) as any
            }) as jest.Mocked<AlarmRepository>;

            expect(async () => {
                await deleteAlarm(mockAlarmRepository, 'deviceToken');
            }).rejects.toThrow(DeleteError);
        });
    });
});