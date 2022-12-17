import {Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {RequestWithBody} from '../types/requestTypes';
import {body, cookie} from 'express-validator';
import {inputValidationMiddleware, inputValidationMiddleware_401} from '../middlewares/input-validation-middleware';
import {authInputModel, bearerAuthModel} from '../models/auth-models/authInputModel';
import {authUserOutputModel, usersQueryRepositories} from '../repositories/users/users-query-repositories';
import {usersService} from '../domain/users-service';
import {bearerAuthorisationMiddleware} from '../middlewares/bearer-uthorisation-middleware';
import {jwtService} from '../application/jwt-service';
import {authService} from '../domain/auth-service';
import {CreateUserInputModel} from '../models/users-models/CreateUserInputModel';
import {CreateBlogInputModel} from '../models/auth-models/EmailConfirmationInputModel';
import {resendInputModel} from '../models/auth-models/resendInputModel';
import {Request} from 'express';
import {accessDataType} from '../models/auth-models/assessDataType';
import * as http from 'http';

export const authRouter = Router({})


const userLoginOrEmailValidation = body('loginOrEmail')
    .trim()
    .matches(`^([\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}|[a-zA-Z0-9_-]*)$`)
    .withMessage('Request should consist valid LoginOrEmail')


const userPasswordValidation = body('password')
    .trim()
    .isLength({
        min: 6,
        max: 20
    })
    .withMessage('Request should consist password with length more than 5 and less than 21')

const userLoginValidation = body('login')
    .trim()
    .isLength({
        min: 3,
        max: 10
    })
    .matches(`^[a-zA-Z0-9_-]*$`)
    .withMessage('Request should consist login with length more than 2 and less than 11')

const userLoginExistValidation = body('login')
    .trim()
    .custom(async login => {
        const user = await usersQueryRepositories.getUserByEmailOrLogin(login, '')
        if (user) return Promise.reject()
    })
    .withMessage('User already exist')

const userEmailValidation = body('email')
    .trim()
    .matches(`^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`)
    .withMessage('Request should consist email')


const userEmailExistValidation = body('email')
    .trim()
    .custom(async email => {
        const user = await usersQueryRepositories.getUserByEmailOrLogin('', email)
        if (user) return Promise.reject()
    })
    .withMessage('Email already registered')

const codeConfirmedValidation = body('code')
    .trim()
    .custom(async code => {
        const user = await usersQueryRepositories.getUserByConfirmationCode(code)
        if (user.emailConfirmation.isConfirmed) return Promise.reject()
    })
    .withMessage('Email already registered')

const emailConfirmedValidation = body('email')
    .trim()
    .custom(async email => {
        const user = await usersQueryRepositories.getUserByEmailOrLogin('', email)
        if (user.emailConfirmation.isConfirmed) return Promise.reject()
    })
    .withMessage('Email already confirmed')

const emailDoesntValidation = body('email')
    .trim()
    .custom(async email => {
        const user = await usersQueryRepositories.getUserByEmailOrLogin('', email)
        if (!user) return Promise.reject()
    })
    .withMessage('Email doesnt exist')


const cookieRefreshTokenValidation = cookie('refreshToken')
    .isJWT()
    .withMessage('RefreshToken doesnt exist')

authRouter.get('/me',
    bearerAuthorisationMiddleware,
    async (req: RequestWithBody<bearerAuthModel>, res: Response<ErrorType | authUserOutputModel>) => {

        // @ts-ignore
        if (req.user) {
            res.status(httpStatus.OK_200)
            // @ts-ignore
            res.json(req.user)
            return
        }

        res.sendStatus(httpStatus.UNATHORIZED_401)
    })


// Login
authRouter.post('/login',
    userPasswordValidation,
    userLoginOrEmailValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<authInputModel>,
           res: Response<ErrorType | { accessToken: string }>
    ) => {
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

            const validPassword = await usersService.checkCredentials(userData, req.body)

            const refreshToken = await authService.createJWTRefreshToken(userData.accountData.id)

            if (validPassword) {
                res.status(httpStatus.OK_200)
                res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: false})
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
    })


authRouter.post('/registration',
    userPasswordValidation,
    userLoginValidation,
    userLoginExistValidation,
    userEmailValidation,
    userEmailExistValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<CreateUserInputModel>,
           res: Response<ErrorType>
    ) => {
        const user = await authService.createUser(req.body)
        if (user) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return
        }
    })


authRouter.post('/registration-confirmation',
    codeConfirmedValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<CreateBlogInputModel>,
           res: Response<ErrorType>
    ) => {
        const result = await authService.confirmEmail(req.body.code)

        if (result) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        } else {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }

    })


authRouter.post('/registration-email-resending',
    userEmailValidation,
    emailDoesntValidation,
    emailConfirmedValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<resendInputModel>,
           res: Response<ErrorType>
    ) => {

        const result = await authService.resendConfirmEmail(req.body.email)

        if (result) {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        } else {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }

    })


authRouter.post('/logout',
    cookieRefreshTokenValidation,
    inputValidationMiddleware_401,
    async (req: Request,
           res: Response<ErrorType>
    ) => {
        const accessData: accessDataType = await jwtService.getAccessDataFromJWT(req.cookies.refreshToken)

        if (!accessData) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const logoutResult = await authService.logOutWithRefreshToken(accessData)

        if (logoutResult) {
            res.cookie('refreshToken', null, {httpOnly: true, secure: false}).sendStatus(httpStatus.NO_CONTENT_204)
            return
        } else {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }
    })


authRouter.post('/refresh-token',
    cookieRefreshTokenValidation,
    inputValidationMiddleware_401,
    async (req: Request,
           res: Response
    ) => {

        const accessData: accessDataType = await jwtService.getAccessDataFromJWT(req.cookies.refreshToken)

        console.log(accessData)


        if (!accessData) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const userAccessToken = await usersQueryRepositories.getUserAccessTokenById(accessData.userId)

        if (accessData.refreshToken !== userAccessToken) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

        const refreshToken = await authService.createJWTRefreshToken(accessData.userId)

        if (refreshToken) {
            res.status(httpStatus.OK_200)
            res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: false})
            res.json(
                {
                    accessToken: await jwtService.createJwt(accessData.userId)
                }
            )
        } else {
            res.sendStatus(httpStatus.UNATHORIZED_401)
            return
        }

    })