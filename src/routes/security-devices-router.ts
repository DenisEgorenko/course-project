import {Router} from 'express';
import {cookie} from 'express-validator';
import {inputValidationMiddleware_401} from '../middlewares/input-validation-middleware';
import {securityDevicesController} from "../composition-root";

export const SecurityDevicesRouter = Router({})


const cookieRefreshTokenValidation = cookie('refreshToken')
    .isJWT()
    .withMessage('RefreshToken doesnt exist')


// Controller


// Routes

SecurityDevicesRouter.get('/devices',
    cookieRefreshTokenValidation,
    inputValidationMiddleware_401,
    securityDevicesController.getAllDevices.bind(securityDevicesController)
)

SecurityDevicesRouter.delete('/devices/',
    cookieRefreshTokenValidation,
    inputValidationMiddleware_401,
    securityDevicesController.deleteAllDevices.bind(securityDevicesController)
)

SecurityDevicesRouter.delete('/devices/:deviceId',
    cookieRefreshTokenValidation,
    inputValidationMiddleware_401,
    securityDevicesController.deleteDevice.bind(securityDevicesController)
)


