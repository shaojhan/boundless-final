import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path, { dirname } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import cors from 'cors';
// import router 匯入路由
// routes/index.js, instrument.js, lesson.js superseded by DDD catalog routers
import jamRouter from './routes/jam.js';
import couponRouter from './routes/coupon.js';
import userRouter from './routes/user.js';
// import articleRouter from './routes/article.js'; // superseded by DDD articleRouter
import googleLoginRouter from './routes/google-login.js';
import cartRouter from './routes/cart.js';
import forgetpasswordRouter from './routes/reset-password.js';
import ecpayusersRouter from './routes/ecpay-users.js';
import ecpayorderRouter from './routes/ecpay-order.js';
// routes/auth.js kept for reference during Phase 1 — superseded by DDD authRouter
// import authRouter from './routes/auth.js';
import { createAuthRouter } from './src/interfaces/routers/authRouter.js';
import { createInstrumentRouter } from './src/interfaces/routers/instrumentRouter.js';
import { createLessonRouter } from './src/interfaces/routers/lessonRouter.js';
import { createCatalogIndexRouter } from './src/interfaces/routers/catalogIndexRouter.js';
import { createArticleRouter } from './src/interfaces/routers/articleRouter.js';
import { authService, instrumentService, lessonService, articleService } from './src/container.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 設定允許互動的網域，讓port 3000  和 5500間可以互動
const whitelist = [
  'http://localhost:3005',
  'http://localhost:3000',
  'http://localhost:3001',
  undefined,
];
const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允許傳遞資料'));
    }
  },
};

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  // API 一律禁止快取，避免瀏覽器條件式請求回 304
  delete req.headers['if-none-match'];
  delete req.headers['if-modified-since'];
  res.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});
// 使用路由（catalogIndexRouter 必須在 static 之前，避免 GET / 被 public/index.html 攔截）
app.use('/', createCatalogIndexRouter(lessonService));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/jam', jamRouter);
app.use('/api/instrument', createInstrumentRouter(instrumentService));
app.use('/api/lesson', createLessonRouter(lessonService));
app.use('/api/coupon', couponRouter);
app.use('/api/user', userRouter);
app.use('/api/article', createArticleRouter(articleService));
app.use('/api/google-login', googleLoginRouter);
app.use('/api/cart', cartRouter);
app.use('/api/reset-password', forgetpasswordRouter);

app.use('/api/order', ecpayorderRouter);
app.use('/api/users', ecpayusersRouter);
app.use('/api/auth', createAuthRouter(authService));
// catch 404 and forward to error handler
app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (
  err: { message: string; status?: number },
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
