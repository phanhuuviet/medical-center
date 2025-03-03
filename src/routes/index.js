import { PREFIX_API } from '../constants/index.js';

import authRouter from './auth-router.js';
import clinicRouter from './clinic-router.js';
import userRouter from './user-router.js';
import utilRouter from './util-router.js';

const routes = (app) => {
    app.use(`${PREFIX_API}/auth`, authRouter);
    app.use(`${PREFIX_API}/util`, utilRouter);
    app.use(`${PREFIX_API}/user`, userRouter);
    app.use(`${PREFIX_API}/clinic`, clinicRouter);
};

export default routes;
