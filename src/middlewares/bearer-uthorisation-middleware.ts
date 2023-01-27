import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import {httpStatus} from '../types/responseTypes';
import {jwtService} from '../application/jwt-service';
import {usersQueryRepositories} from '../features/users/infrastructure/users-query-repositories';

const auth = {login: 'admin', password: 'qwerty'}

export const bearerAuthorisationMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.headers.authorization) {
        res.sendStatus(httpStatus.UNATHORIZED_401)
        return;
    }

    const authType = (req.headers.authorization || '').split(' ')[0] || ''

    if (authType !== 'Bearer') {
        res.status(401).send('Authentication wrong.')
        return
    }

    const token = (req.headers.authorization || '').split(' ')[1] || ''

    const userId = await jwtService.getUserIdByToken(token)

    const user = await usersQueryRepositories.getUserByIdAuth(userId)

    if (user) {
        // @ts-ignore
        req.user = user
        next()
    } else {
        res.sendStatus(httpStatus.UNATHORIZED_401)
    }
}