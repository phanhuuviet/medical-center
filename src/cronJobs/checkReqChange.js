import { endOfDay, isValid, startOfDay } from 'date-fns';
import cron from 'node-cron';

import ClinicScheduleModel from '../models/ClinicScheduleModel.js';
import RequestChangeScheduleModel from '../models/RequestChangeScheduleModel.js';

export const startDailyCheckReqJob = async () => {
    // Cron chạy lúc 00:00 mỗi ngày
    cron.schedule('0 0 * * *', async () => {
        try {
            const now = new Date();

            if (!isValid(now)) {
                throw new Error('Thời gian hiện tại không hợp lệ!');
            }

            const startCurrentDay = startOfDay(now);
            const endCurrentDay = endOfDay(now);

            // Tìm bản ghi applyDate trong khoảng ngày hôm nay, và có clinicId (không null)
            const records = await RequestChangeScheduleModel.find({
                applyDate: { $gte: startCurrentDay, $lte: endCurrentDay },
                clinicId: { $exists: true, $ne: null },
            });

            // TODO: Xử lý logic bạn muốn với các bản ghi này
            if (records?.length <= 0) {
                console.log('Có bản ghi RequestChangeSchedule trong ngày hôm nay:', records);
            }

            for (const item of records) {
                const { clinicId, newValue } = item;

                await Promise.all(
                    ClinicScheduleModel.updateMany({ _id: { $in: newValue }, clinicId }, { isActive: true }),
                    ClinicScheduleModel.updateMany({ _id: { $nin: newValue }, clinicId }, { isActive: false }),
                );
            }
        } catch (error) {
            console.error('Lỗi khi chạy cron job daily check:', error);
        }
    });

    console.log('Cron job daily check started');
};
