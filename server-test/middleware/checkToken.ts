import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import 'dotenv/config.js';
import type { JwtPayload } from '../types/index.js';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;

/**
 * checkToken — JWT Bearer token 驗證中介軟體
 *
 * 驗證成功後將 decoded payload 注入 req.decoded，供後續路由使用。
 * 驗證失敗（無 token / 過期 / 無效）一律回傳 401。
 */
export function checkToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let token = req.get('Authorization');

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
    jwt.verify(token, accessTokenSecret, (err, decoded) => {
      if (err) {
        const message =
          err.name === 'TokenExpiredError'
            ? '登入已逾時，請重新整理頁面。'
            : '登入驗證失效，請重新登入。';
        res.status(401).json({ status: 'error', message, code: err.name });
      } else {
        req.decoded = decoded as JwtPayload;
        next();
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: '無登入驗證資料，請重新登入。',
      code: 'NO_TOKEN',
    });
  }
}
