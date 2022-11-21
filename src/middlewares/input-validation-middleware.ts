import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import {ErrorType} from '../types/responseTypes';

export const inputValidationMiddleware = (req: Request<any>, res: Response<ErrorType>, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errorsMessages: errors.array({onlyFirstError: true}).map(erorr => ({
                message: erorr.msg,
                field: erorr.param
            }))
        });
    } else {
        next()
    }
}