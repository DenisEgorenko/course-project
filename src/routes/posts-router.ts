import {Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from '../types/requestTypes';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {postsURImodel} from '../models/posts-models/postsURImodel';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';
import {postsOutputModel, postsQueryRepositories} from '../repositories/posts/posts-query-repositories';
import {postTypeDB} from '../database/dbInterface';
import {postsService} from '../domain/posts-service';
import {postsQueryModel} from '../models/posts-models/postsQueryModel';
import {commentsURImodel} from '../models/comments-models/commentsURImodel';
import {
    commentOutputModel,
    commentsOutputModel,
    commentsQueryRepositories
} from '../repositories/comments/comments-query-repositories';
import {commentsService} from '../domain/comments-service';
import {bearerAuthorisationMiddleware} from '../middlewares/bearer-uthorisation-middleware';
import {CreateCommentInputModel} from '../models/comments-models/CreateCommentInputModel';
import {commentsQueryModel} from '../models/comments-models/commentsQueryModel';

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


export const commentContentValidation = body('content').trim().isLength({
    min: 20,
    max: 300
}).withMessage('Request should consist comment content with length more than 20 less than 301')


//Controller

class PostsController {
    async getAllPosts(req: RequestWithQuery<postsQueryModel>, res: Response<postsOutputModel>) {
        res.status(httpStatus.OK_200)
        res.json(await postsQueryRepositories.getAllPosts(req.query))
    }

    async getPostById(req: RequestWithParams<postsURImodel>, res: Response<postTypeDB>) {

        const foundPost = await postsQueryRepositories.getPostById(req.params.id)

        if (!foundPost) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        res.status(httpStatus.OK_200)
        res.json(foundPost)
    }

    async createPost(req: RequestWithBody<CreatePostInputModel>, res: Response<ErrorType | postTypeDB>) {
        try {
            const id = await postsService.createNewPost(req.body)
            const result = await postsQueryRepositories.getPostById(id)
            res.status(httpStatus.CREATED_201)
            res.json(result)
        } catch (e) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    }

    async updatePost(req: RequestWithParamsAndBody<postsURImodel, UpdatePostInputModel>, res: Response<ErrorType>) {

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
    }

    async deletePost(req: RequestWithParams<postsURImodel>, res: Response) {

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

    }

    async getPostComments(req: RequestWithParamsAndQuery<commentsURImodel, commentsQueryModel>, res: Response<commentsOutputModel>) {

        const post = await postsQueryRepositories.getPostById(req.params.postId)

        if (!post) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        const foundPost = await commentsQueryRepositories.getAllPostComments(req.params.postId, req.query)

        res.status(httpStatus.OK_200)
        res.json(foundPost)
    }

    async createPostComment(req: RequestWithParamsAndBody<commentsURImodel, CreateCommentInputModel>, res: Response<commentOutputModel>) {
        const post = await postsQueryRepositories.getPostById(req.params.postId)

        if (!post) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }
        // @ts-ignore
        const id = await commentsService.createNewComment(req.user, req.params.postId, req.body)
        const result = await commentsQueryRepositories.getCommentById(id)

        if (result !== null) {
            res.status(httpStatus.CREATED_201)
            res.json(result)
        }

    }
}

const postsControllerInstance = new PostsController()

// Posts
// Read Posts
postsRouter.get('/', postsControllerInstance.getAllPosts)

postsRouter.get('/:id', postsControllerInstance.getPostById)

postsRouter.post('/',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    postsControllerInstance.createPost
)

postsRouter.put('/:id',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    postsControllerInstance.updatePost
)

postsRouter.delete('/:id',
    authorisationMiddleware,
    inputValidationMiddleware,
    postsControllerInstance.deletePost
)

// Comments
postsRouter.get('/:postId/comments', postsControllerInstance.getPostComments)

postsRouter.post('/:postId/comments',
    bearerAuthorisationMiddleware,
    commentContentValidation,
    inputValidationMiddleware,
    postsControllerInstance.createPostComment
)