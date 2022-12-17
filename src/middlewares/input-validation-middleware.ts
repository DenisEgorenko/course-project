import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import {ErrorType} from '../types/responseTypes';

export const inputValidationMiddleware = (req: Request<any>, res: Response<ErrorType>, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            errorsMessages: errors.array({onlyFirstError: true}).map(error => ({
                message: error.msg,
                field: error.param
            }))
        });
    } else {
        next()
    }
}


export const inputValidationMiddleware_401 = (req: Request<any>, res: Response<ErrorType>, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.sendStatus(401)
        return
    } else {
        next()
    }
}