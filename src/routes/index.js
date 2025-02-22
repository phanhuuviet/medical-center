import authRouter from './auth-router.js';
import utilRouter from './util-router.js';

const routes = (app) => {
    app.use('/auth', authRouter);
    app.use('/util', utilRouter);
};

export default routes;
