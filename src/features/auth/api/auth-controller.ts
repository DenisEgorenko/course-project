import {AuthService} from '../application/auth-service';
import {UsersService} from '../../users/application/users-service';
import {Request, Response} from 'express';
import {ErrorType, httpStatus} from '../../../types/responseTypes';
import {authUserOutputModel, usersQueryRepositories} from '../../users/infrastructure/users-query-repositories';
import {RequestWithBody} from '../../../types/requestTypes';
import {authInputModel} from '../domain/dto/authInputModel';
import {jwtService} from '../../../application/jwt-service';
import {CreateUserDTO} from '../../users/domain/dto/CreateUserDTO';
import {CreateBlogInputModel} from '../domain/dto/EmailConfirmationInputModel';
import {resendInputModel} from '../domain/dto/resendInputModel';
import {accessDataType} from '../domain/models/assessDataType';
import {
    securityDevicesQueryRepositories
} from '../../../repositories/securityDevices/security-devices-query-repositories';
import {PasswordRecoveryInputModel} from '../domain/dto/passwordRecoveryInputModel';
import {NewPasswordInputModel} from '../domain/dto/newPasswordInputModel';
import {userTypeDB} from '../../../database/dbInterface';
import * as dotenv from 'dotenv'
import {injectable} from 'inversify';

dotenv.config()

const mode: boolean = process.env.TEST_MODE !== 'true'


@injectable()
export class AuthController {

    constructor(
        protected authService: AuthService,
        protected usersService: UsersService
    ) {

    }

    async registration(req: RequestWithBody<CreateUserDTO>, res: Response<ErrorType>) {
        const user = await this.authService.createUser(req.body)
        if (user) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return
        }
    }

    async registrationConfirmation(req: RequestWithBody<CreateBlogInputModel>, res: Response<ErrorType>) {

        const result = await this.authService.confirmEmail(req.body.code)

        if (result) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        } else {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    }


    async authMe(req: Request, res: Response<ErrorType | authUserOutputModel>) {
        // @ts-ignore
        if (req.user) {
            res.status(httpStatus.OK_200)
            // @ts-ignore
            res.json(req.user)
            return
        }
        res.sendStatus(httpStatus.UNATHORIZED_401)
    }

    async login(req: RequestWithBody<authInputModel>, res: Response<ErrorType | { accessToken: string }>) {
        try {
            const userData = await usersQueryRepositories.getUserByEmailOrLogin(req.body.loginOrEmail)
            if (!userData) {
                res.sendStatus(httpStatus.UNATHORIZED_401)
                return
            }
            if (!userData.emailConfirmation.isConfirmed) {
                res.sendStatus(httpStatus.UNATHORIZED_401)
                return
            }
            const validPassword = await this.usersService.checkCredentials(userData, req.body)
            const refreshToken = await this.authService.createSecuritySession(
                userData.accountData.id,
                req.ip,
                req.headers['user-agent'] || 'undefined'
            )
            if (validPassword) {
                res.status(httpStatus.OK_200)
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: mode,
                    secure: mode
                })
                res.json(
                    {
                        accessToken: await jwtService.createJwt(userData.accountData.id)
                    }
                )
            } else {
                res.sendStatus(httpStatus.UNATHORIZED_401)
            }

        } catch (e) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
        }
    }

    async registrationEmailResending(req: RequestWithBody<resendInputModel>, res: Response<ErrorType>) {

        let user = await usersQueryRepositories.getUserByEmailOrLogin(req.body.email)

        const result = await this.authService.resendConfirmEmail(req.body.email, user)

        if (result) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        } else {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }

    }

    async logout(req: Request, res: Response<ErrorType>) {
        const accessData: accessDataType = await jwtService.getAccessDataFromJWT(req.cookies.refreshToken)

        if (!accessData) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const logoutResult = await this.authService.logOutWithRefreshToken(accessData)

        if (logoutResult) {
            res.clearCookie('refreshToken').sendStatus(httpStatus.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }
    }

    async refreshToken(req: Request, res: Response) {

        const accessData: accessDataType = await jwtService.getAccessDataFromJWT(req.cookies.refreshToken)

        if (!accessData) {
            console.log('Refresh token Error because no access data')
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const sessionExist = await securityDevicesQueryRepositories.findActiveSessionByDeviceId(accessData.deviceId)

        if (!sessionExist.length) {
            console.log('Refresh token Error because no session data')

            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const refreshToken = await this.authService.updateSecuritySession(
            accessData.userId,
            req.ip,
            req.headers['user-agent'] || 'undefined',
            accessData.deviceId
        )

        if (refreshToken) {
            res.status(httpStatus.OK_200)
            res.cookie('refreshToken', refreshToken, {httpOnly: mode, secure: mode})
            res.json(
                {
                    accessToken: await jwtService.createJwt(accessData.userId)
                }
            )
        } else {
            console.log('Refresh token Error because ref token not generated')

            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

    }

    async passwordRecovery(req: RequestWithBody<PasswordRecoveryInputModel>, res: Response<ErrorType>) {

        const user = await usersQueryRepositories.getUserByEmailOrLogin(req.body.email)

        if (!user) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        }

        const result = await this.authService.passwordRecovery(user)

        if (result) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return
        }

    }

    async newPassword(req: RequestWithBody<NewPasswordInputModel>, res: Response<ErrorType>) {

        const user: userTypeDB = await usersQueryRepositories.getUserByRecoveryCode(req.body.recoveryCode)

        if (user.passwordRecovery.expirationDate && user.passwordRecovery.expirationDate < new Date()) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return
        }

        const result = await this.authService.setNewPassword(user.accountData.id, req.body.newPassword)

        if (result) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        } else {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    }
}