import {Request, Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from '../types/requestTypes';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {postsRepositories} from '../repositories/posts/posts-repositories';
import {postsURImodel} from '../models/posts-models/postsURImodel';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';
import {postsOutputModel, postsQueryRepositories} from '../repositories/posts/posts-query-repositories';
import {postTypeDB} from '../database/dbInterface';
import {postsService} from '../domain/posts-service';
import {blogsService} from '../domain/blogs-service';
import {blogsQueryRepositories} from '../repositories/blogs/blogs-query-repositories';
import {postsQueryModel} from '../models/posts-models/postsQueryModel';

export const postsRouter = Router({})


export const titleValidation = body('title').trim().isLength({
    min: 1,
    max: 30
}).withMessage('Request should consist title with length less than 30')


export const shortDescriptionValidation = body('shortDescription').trim().isLength({
    min: 1,
    max: 100
}).withMessage('Request should consist short Description with length less than 100')

export const contentValidation = body('content').trim().isLength({
    min: 1,
    max: 1000
}).withMessage('Request should consist content with length less than 1000')

const blogIdValidation = body('blogId')
    .trim()
    .isLength({
        min: 1
    })
    .custom(async value => {
        return await postsQueryRepositories.ifBlogIdExist(value)
    })
    .withMessage('Request should consist content with length more than 1')

// Read
postsRouter.get('/', async (req: RequestWithQuery<postsQueryModel>, res: Response<postsOutputModel>) => {
    res.status(httpStatus.OK_200)
    res.json(await postsQueryRepositories.getAllPosts(req.query))
})

postsRouter.get('/:id', async (req: RequestWithParams<postsURImodel>, res: Response<postTypeDB>) => {

    const foundPost = await postsQueryRepositories.getPostById(req.params.id)

    if (!foundPost) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    res.status(httpStatus.OK_200)
    res.json(foundPost)
})

// Create post
postsRouter.post('/',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<CreatePostInputModel>, res: Response<ErrorType | postTypeDB>) => {
        try {
            const id = await postsService.createNewPost(req.body)
            const result = await postsQueryRepositories.getPostById(id)
            res.status(httpStatus.CREATED_201)
            res.json(result)
        } catch (e) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
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

        if (!await postsService.updatePost(req.params.id, req.body)) {
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

        const deleteVideo = await postsService.deletePost(req.params.id)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }

    })
