import {Router} from 'express';
import {cookie} from 'express-validator';
import {inputValidationMiddleware_401} from '../middlewares/input-validation-middleware';
import {container} from "../composition-root";
import {SecurityDevicesController} from "../controllers/security-devices-controller";

export const SecurityDevicesRouter = Router({})


const cookieRefreshTokenValidation = cookie('refreshToken')
    .isJWT()
    .withMessage('RefreshToken doesnt exist')


// Controller


const securityDevicesController = container.resolve(SecurityDevicesController)


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


