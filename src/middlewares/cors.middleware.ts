import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { appSettings } from 'src/configs/app-settings';
import { cleanOrigin, cleanOrigins } from 'src/utils/helper';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
    constructor() {}
    async use(req: Request, res: Response, next: NextFunction) {
        const origin = req.headers.origin;
        const cleanedOrigin = cleanOrigin(origin);

        if (appSettings.development) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader(
                'Access-Control-Allow-Methods',
                'GET,HEAD,PUT,PATCH,POST,DELETE',
            );
            res.setHeader(
                'Access-Control-Allow-Headers',
                'Content-Type, Accept',
            );
            return next();
        }

        if (
            !cleanedOrigin ||
            cleanOrigins([...appSettings.corsURLs]).includes(cleanedOrigin)
        ) {
            res.setHeader('Access-Control-Allow-Origin', origin || '*');
            res.setHeader(
                'Access-Control-Allow-Methods',
                'GET,HEAD,PUT,PATCH,POST,DELETE',
            );
            res.setHeader(
                'Access-Control-Allow-Headers',
                'Content-Type, Accept',
            );
        } else {
            return res
                .status(403)
                .json({ message: 'Domain not allowed by CORS' });
        }

        next();
    }
}
