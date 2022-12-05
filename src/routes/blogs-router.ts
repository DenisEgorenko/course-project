import {Request, Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from '../types/requestTypes';
import {body, param} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {blogsRepositories} from '../repositories/blogs-repositories';
import {CreateBlogInputModel} from '../models/blogs-models/CreateBlogInputModel';
import {blogsURImodel} from '../models/blogs-models/blogsURImodel';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {UpdateBlogInputModel} from '../models/blogs-models/UpdateBlogInputModel';
import {blogsOutputModel, blogsQueryRepositories} from '../repositories/blogs-query-repositories';
import {blogTypeDB, postTypeDB} from '../database/dbInterface';
import {blogsService} from '../domain/blogs-service';
import {blogsQueryModel} from '../models/blogs-models/blogsQueryModel';
import {postsQueryModel} from '../models/posts-models/postsQueryModel';
import {postsOutputModel, postsQueryRepositories} from '../repositories/posts-query-repositories';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {postsService} from '../domain/posts-service';
import {contentValidation, postsRouter, shortDescriptionValidation, titleValidation} from './posts-router';
import {CreatePostBlogInputModel} from '../models/blogs-models/CreatePostBlogInputModel';

export const blogsRouter = Router({})


const blogNameValidation = body('name')
    .trim()
    .isLength({
        min: 1,
        max: 15
    })
    .withMessage('Request should consist title with length less than 15')


const blogDescriptionValidation = body('description')
    .trim()
    .isLength({
        min: 1,
        max: 500
    })
    .withMessage('Request should consist description with length less than 500')

const UrlValidation = body('websiteUrl')
    .isLength({
        min: 1,
        max: 100
    })
    .matches(`^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$`)
    .withMessage('Request should consist websiteUrl')


// Read
blogsRouter.get('/', async (req: RequestWithQuery<blogsQueryModel>, res: Response<blogsOutputModel>) => {
    res.status(httpStatus.OK_200)
    res.json(await blogsQueryRepositories.getAllBlogs(req.query))
})

blogsRouter.get('/:id', async (req: RequestWithParams<blogsURImodel>, res: Response<blogTypeDB>) => {

    const foundBlog = await blogsQueryRepositories.getBlogById(req.params.id)

    if (!foundBlog) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    res.status(httpStatus.OK_200)
    res.json(foundBlog)
})

blogsRouter.get('/:id/posts', async (req: RequestWithParamsAndQuery<blogsURImodel, postsQueryModel>, res: Response<postsOutputModel>) => {

    const blog = await blogsQueryRepositories.getBlogById(req.params.id)

    if (!blog) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    res.status(httpStatus.OK_200)
    res.json(await blogsQueryRepositories.getAllBlogsPosts(req.params.id, req.query))
})

// Create blog
blogsRouter.post('/',
    authorisationMiddleware,
    blogNameValidation,
    blogDescriptionValidation,
    UrlValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<CreateBlogInputModel>, res: Response<ErrorType | blogTypeDB>) => {
        try {
            const id = await blogsService.createNewBlog(req.body)
            const result = await blogsQueryRepositories.getBlogById(id)
            res.status(httpStatus.CREATED_201)
            res.json(result)
        } catch (e) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    })

blogsRouter.post('/:id/posts',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<blogsURImodel, CreatePostInputModel>, res: Response<ErrorType | postTypeDB>) => {

        const blog = await blogsQueryRepositories.getBlogById(req.params.id)

        if (!blog) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        req.body.blogId = req.params.id

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
blogsRouter.put('/:id',
    authorisationMiddleware,
    blogNameValidation,
    blogDescriptionValidation,
    UrlValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<blogsURImodel, UpdateBlogInputModel>, res: Response<ErrorType>) => {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        if (!await blogsService.updateBlog(req.params.id, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return;
        }
    })

// Delete Videos
blogsRouter.delete('/:id',
    authorisationMiddleware,
    inputValidationMiddleware,
    async (req: RequestWithParams<blogsURImodel>, res: Response) => {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteVideo = await blogsService.deleteBlog(req.params.id)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return;
        }

    })
