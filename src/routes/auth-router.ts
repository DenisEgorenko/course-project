import {Router} from 'express';
import {body, cookie} from 'express-validator';
import {inputValidationMiddleware, inputValidationMiddleware_401} from '../middlewares/input-validation-middleware';
import {usersQueryRepositories} from '../repositories/users/users-query-repositories';
import {bearerAuthorisationMiddleware} from '../middlewares/bearer-uthorisation-middleware';
import {requestsAttemptsAuthorisationMiddleware} from "../middlewares/requests-attempts-middleware";
import {authController} from "../composition-root";

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

const userNewPasswordValidation = body('newPassword')
    .trim()
    .isLength({
        min: 6,
        max: 20
    })
    .withMessage('Request should consist password with length more than 5 and less than 21')

const recoveryCodeValidation = body('recoveryCode')
    .trim()
    .custom(async code => {
        const user = await usersQueryRepositories.getUserByRecoveryCode(code)
        if (!user) return Promise.reject()
    })
    .withMessage('Wrong recovery code')

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



// Controller

//Routes

authRouter.get('/me',
    bearerAuthorisationMiddleware,
    authController.authMe.bind(authController)
)

authRouter.post('/login',
    requestsAttemptsAuthorisationMiddleware,
    userPasswordValidation,
    userLoginOrEmailValidation,
    inputValidationMiddleware,
    authController.login.bind(authController)
)

authRouter.post('/registration',
    requestsAttemptsAuthorisationMiddleware,
    userPasswordValidation,
    userLoginValidation,
    userLoginExistValidation,
    userEmailValidation,
    userEmailExistValidation,
    inputValidationMiddleware,
    authController.registration.bind(authController)
)

authRouter.post('/registration-confirmation',
    requestsAttemptsAuthorisationMiddleware,
    codeConfirmedValidation,
    inputValidationMiddleware,
    authController.registrationConfirmation.bind(authController)
)

authRouter.post('/registration-email-resending',
    requestsAttemptsAuthorisationMiddleware,
    userEmailValidation,
    emailDoesntValidation,
    emailConfirmedValidation,
    inputValidationMiddleware,
    authController.registrationEmailResending.bind(authController)
)

authRouter.post('/logout',
    cookieRefreshTokenValidation,
    inputValidationMiddleware_401,
    authController.logout.bind(authController)
)

authRouter.post('/refresh-token',
    cookieRefreshTokenValidation,
    inputValidationMiddleware_401,
    authController.refreshToken.bind(authController)
)

authRouter.post('/password-recovery',
    requestsAttemptsAuthorisationMiddleware,
    userEmailValidation,
    inputValidationMiddleware,
    authController.passwordRecovery.bind(authController)
)

authRouter.post('/new-password',
    requestsAttemptsAuthorisationMiddleware,
    recoveryCodeValidation,
    userNewPasswordValidation,
    inputValidationMiddleware,
    authController.newPassword.bind(authController)
)