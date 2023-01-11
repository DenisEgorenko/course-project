import {Router} from 'express';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {usersController} from "../composition-root";

export const usersRouter = Router({})


const userLoginValidation = body('login')
    .trim()
    .isLength({
        min: 3,
        max: 10
    })
    .matches(`^[a-zA-Z0-9_-]*$`)
    .withMessage('Request should consist login with length more than 2 and less than 11')


const userPasswordValidation = body('password')
    .trim()
    .isLength({
        min: 6,
        max: 20
    })
    .withMessage('Request should consist password with length more than 5 and less than 21')

const userEmailValidation = body('email')
    .trim()
    .matches(`^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`)
    .withMessage('Request should consist email')


// Controller

// Routes
usersRouter.get('/', usersController.getAllUsers.bind(usersController))

usersRouter.post('/',
    authorisationMiddleware,
    userLoginValidation,
    userPasswordValidation,
    userEmailValidation,
    inputValidationMiddleware,
    usersController.createNewUser.bind(usersController)
)

usersRouter.delete('/:id',
    authorisationMiddleware,
    inputValidationMiddleware,
    usersController.deleteUser.bind(usersController)
)
