import {Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {RequestWithBody, RequestWithParams, RequestWithQuery} from '../types/requestTypes';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {CreateUserInputModel} from '../models/users-models/CreateUserInputModel';
import {usersService} from '../domain/users-service';
import {
    userOutputModel,
    usersOutputModel,
    usersQueryRepositories
} from '../repositories/users/users-query-repositories';
import {usersURImodel} from '../models/users-models/usersURImodel';
import {usersQueryModel} from '../models/users-models/usersQueryModel';

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

class UsersController {
    async getAllUsers(req: RequestWithQuery<usersQueryModel>, res: Response<usersOutputModel>) {
        res.status(httpStatus.OK_200)
        res.json(await usersQueryRepositories.getAllUsers(req.query))
    }

    async createNewUser(req: RequestWithBody<CreateUserInputModel>, res: Response<ErrorType | userOutputModel>) {
        try {
            const id = await usersService.createNewUser(req.body)
            const result = await usersQueryRepositories.getUserById(id)
            res.status(httpStatus.CREATED_201)
            res.json(result)
        } catch (e) {
            console.log(e)
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    }

    async deleteUser(req: RequestWithParams<usersURImodel>, res: Response) {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteUser = await usersService.deleteUser(req.params.id)

        if (!deleteUser) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return;
        }

    }
}

const usersControllerInstance = new UsersController()

// Routes
usersRouter.get('/', usersControllerInstance.getAllUsers)

usersRouter.post('/',
    authorisationMiddleware,
    userLoginValidation,
    userPasswordValidation,
    userEmailValidation,
    inputValidationMiddleware,
    usersControllerInstance.createNewUser
)

usersRouter.delete('/:id',
    authorisationMiddleware,
    inputValidationMiddleware,
    usersControllerInstance.deleteUser
)
