import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';

export const inputValidationMiddleware = (req: Request<any>, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errorsMessages: errors.array().map(erorr => ({
                message: erorr.msg,
                field: erorr.param
            }))
        });
    } else {
        next()
    }
}