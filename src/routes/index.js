import { PREFIX_API } from '../constants/index.js';

import authRouter from './auth-router.js';
import clinicRouter from './clinic-router.js';
import clinicScheduleRouter from './clinic-schedule-router.js';
import healthRecordRouter from './health-record-router.js';
import leaveScheduleRouter from './leave-schedule-router.js';
import medicalConsultationHistoryRouter from './medical-consultation-history-router.js';
import medicalServiceRouter from './medical-service-router.js';
import userRouter from './user-router.js';
import utilRouter from './util-router.js';

const routes = (app) => {
    app.use(`${PREFIX_API}/auth`, authRouter);
    app.use(`${PREFIX_API}/util`, utilRouter);
    app.use(`${PREFIX_API}/user`, userRouter);
    app.use(`${PREFIX_API}/clinic`, clinicRouter);
    app.use(`${PREFIX_API}/medical-service`, medicalServiceRouter);
    app.use(`${PREFIX_API}/clinic-schedule`, clinicScheduleRouter);
    app.use(`${PREFIX_API}/leave-schedule`, leaveScheduleRouter);
    app.use(`${PREFIX_API}/health-record`, healthRecordRouter);
    app.use(`${PREFIX_API}/medical-consultation-history`, medicalConsultationHistoryRouter);
};

export default routes;
