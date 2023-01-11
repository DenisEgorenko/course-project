import {NextFunction, Request, Response} from 'express';
import {jwtService} from '../application/jwt-service';


export const likesAuthorisationMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const token = (req.headers.authorization || '').split(' ')[1] || ''

    const userId = await jwtService.getUserIdByToken(token)

    if (userId) {
        // @ts-ignore
        req.userId = userId
    }
    next()

}