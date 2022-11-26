import {Request, Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from '../types/requestTypes';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {postType} from '../repositories/dataBase';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {postsRepositories} from '../repositories/posts-repositories';
import {postsURImodel} from '../models/posts-models/postsURImodel';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';

export const postsRouter = Router({})


const titleValidation = body('title').trim().isLength({
    min: 1,
    max: 30
}).withMessage('Request should consist title with length less than 30')


const shortDescriptionValidation = body('shortDescription').trim().isLength({
    min: 1,
    max: 100
}).withMessage('Request should consist short Description with length less than 100')

const contentValidation = body('content').trim().isLength({
    min: 1,
    max: 1000
}).withMessage('Request should consist content with length less than 1000')

const blogIdValidation = body('blogId')
    .trim()
    .isLength({
        min: 1
    })
    .custom( async value => {
        return await postsRepositories.ifBlogIdExist(value)
    })
    .withMessage('Request should consist content with length more than 1')

// Read
postsRouter.get('/', async (req: Request, res: Response<Array<postType>>) => {
    res.status(httpStatus.OK_200)
    res.json(await postsRepositories.getAllPosts())
})

postsRouter.get('/:id', async (req: RequestWithParams<postsURImodel>, res: Response<postType>) => {

    const foundPost = await postsRepositories.getPostById(req.params.id)

    if (!foundPost) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    res.status(httpStatus.OK_200)
    res.json(foundPost)
})

// Create videos
postsRouter.post('/',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<CreatePostInputModel>, res: Response<ErrorType | postType>) => {

        res.status(httpStatus.CREATED_201)
        res.json(await postsRepositories.createNewPost(req.body))
    })

// Update Videos
postsRouter.put('/:id',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<postsURImodel, UpdatePostInputModel>, res: Response<ErrorType>) => {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        if (!await postsRepositories.updatePost(req.params.id, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }
    })

// Delete Videos
postsRouter.delete('/:id',
    authorisationMiddleware,
    inputValidationMiddleware,
    async (req: RequestWithParams<postsURImodel>, res: Response) => {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteVideo = await postsRepositories.deletePost(req.params.id)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }

    })
