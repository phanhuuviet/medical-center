import authRouter from './auth-router.js';
import userRouter from './user-router.js';
import utilRouter from './util-router.js';

const routes = (app) => {
    app.use('/auth', authRouter);
    app.use('/util', utilRouter);
    app.use('/user', userRouter);
};

export default routes;
