import {Request, Response, Router} from 'express';
import {httpStatus} from '../types/responseTypes';
import {RequestWithParams} from '../types/requestTypes';
import {cookie} from 'express-validator';
import {inputValidationMiddleware, inputValidationMiddleware_401} from '../middlewares/input-validation-middleware';
import {commentsURImodel} from '../models/comments-models/commentsURImodel';
import {bearerAuthorisationMiddleware} from '../middlewares/bearer-uthorisation-middleware';
import {jwtService} from "../application/jwt-service";
import {
    securityDevicesQueryRepositories,
    sessionsOutputModel
} from "../repositories/securityDevices/security-devices-query-repositories";
import {authService} from "../domain/auth-service";
import {accessDataType} from "../models/auth-models/assessDataType";
import {deleteSecurityDevicesURIModel} from "../models/security-devices-models/deleteSecurityDevicesURImodel";
import {securityDevicesRepositories} from "../repositories/securityDevices/security-devices-repositories";

export const SecurityDevicesRouter = Router({})


const cookieRefreshTokenValidation = cookie('refreshToken')
    .isJWT()
    .withMessage('RefreshToken doesnt exist')


SecurityDevicesRouter.get('/devices',
    cookieRefreshTokenValidation,
    inputValidationMiddleware_401,
    async (req: Request, res: Response<sessionsOutputModel[]>) => {
        console.log(req.cookies.refreshToken)

        const userId: string = await jwtService.getUserIdByToken(req.cookies.refreshToken)

        console.log(userId)

        if (!userId) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const sessions: sessionsOutputModel[] = await securityDevicesQueryRepositories.getAllUserSessions(userId)

        res.status(httpStatus.OK_200)
        res.json(sessions)
    })

// Update Comment


// Delete Comment
SecurityDevicesRouter.delete('/devices/',
    inputValidationMiddleware,
    async (req: RequestWithParams<commentsURImodel>, res: Response) => {

        const accessData: accessDataType = await jwtService.getAccessDataFromJWT(req.cookies.refreshToken)

        if (!accessData) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const sessionExist = await securityDevicesQueryRepositories.findActiveSessionByDeviceId(accessData.deviceId)

        if (!sessionExist) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        await authService.removeAllSecuritySessions(accessData.userId, accessData.deviceId)

        res.sendStatus(httpStatus.NO_CONTENT_204)
        return
    })


SecurityDevicesRouter.delete('/devices/:deviceId',
    inputValidationMiddleware,
    async (req: RequestWithParams<deleteSecurityDevicesURIModel>, res: Response) => {

        const accessData: accessDataType = await jwtService.getAccessDataFromJWT(req.cookies.refreshToken)

        if (!accessData) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const session = await securityDevicesQueryRepositories.findUserIdForActiveSessionByDeviceId(req.params.deviceId)

        if (!session) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        if(accessData.userId !== session.userId) {
            res.sendStatus(httpStatus.FORBIDDEN_403)
        }

        await authService.removeSecuritySession(accessData.deviceId)

        res.sendStatus(httpStatus.NO_CONTENT_204)
        return
    })


