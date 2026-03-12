import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import 'dotenv/config.js';
import type { JwtPayload } from '../types/index.js';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;

/**
 * checkAdmin — 管理員專用 JWT 驗證中介軟體
 *
 * 在 checkToken 的基礎上額外檢查 isAdmin 旗標。
 * 非管理員回傳 403，未登入或 token 無效回傳 401。
 */
export function checkAdmin(req: Request, res: Response, next: NextFunction): void {
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
        const payload = decoded as JwtPayload;
        if (!payload.isAdmin) {
          res.status(403).json({
            status: 'error',
            message: '無管理員權限',
            code: 'FORBIDDEN',
          });
        } else {
          req.decoded = payload;
          next();
        }
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
