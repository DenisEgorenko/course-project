import {Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {RequestWithBody, RequestWithParams, RequestWithQuery} from '../types/requestTypes';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {CreateBlogInputModel} from '../models/blogs-models/CreateBlogInputModel';
import {blogsURImodel} from '../models/blogs-models/blogsURImodel';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {blogsOutputModel, blogsQueryRepositories} from '../repositories/blogs/blogs-query-repositories';
import {blogTypeDB} from '../database/dbInterface';
import {blogsService} from '../domain/blogs-service';
import {blogsQueryModel} from '../models/blogs-models/blogsQueryModel';
import {authInputModel} from '../models/auth-models/authInputModel';
import {usersQueryRepositories} from '../repositories/users/users-query-repositories';
import {usersService} from '../domain/users-service';

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


// Create blog
authRouter.post('/login',
    userPasswordValidation,
    userLoginOrEmailValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<authInputModel>, res: Response<ErrorType | blogTypeDB>) => {
        try {

            const userData = await usersQueryRepositories.getUserByEmailOrLogin(req.body.loginOrEmail)
            console.log(userData)

            if (!userData) {
                res.sendStatus(httpStatus.UNATHORIZED_401)
                return
            }

            const result = await usersService.checkCredentials(userData, req.body)

            if (result) {
                res.sendStatus(httpStatus.NO_CONTENT_204)
            } else {
                res.sendStatus(httpStatus.UNATHORIZED_401)
            }

        } catch (e) {
            res.sendStatus(httpStatus.UNATHORIZED_401)
        }
    })