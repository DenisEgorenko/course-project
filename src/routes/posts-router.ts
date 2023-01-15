import {Router} from 'express';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {postsQueryRepositories} from '../repositories/posts/posts-query-repositories';
import {bearerAuthorisationMiddleware} from '../middlewares/bearer-uthorisation-middleware';
import {likesAuthorisationMiddleware} from "../middlewares/likes-authorisation-middleware";
import {container} from "../composition-root";
import {AuthController} from "../controllers/auth-controller";
import {PostsController} from "../controllers/posts-controller";

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

const postsController = container.resolve(PostsController)


// Posts
// Read Posts
postsRouter.get('/', postsController.getAllPosts.bind(postsController))

postsRouter.get('/:id', postsController.getPostById.bind(postsController))

postsRouter.post('/',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    postsController.createPost.bind(postsController)
)

postsRouter.put('/:id',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    postsController.updatePost.bind(postsController)
)

postsRouter.delete('/:id',
    authorisationMiddleware,
    inputValidationMiddleware,
    postsController.deletePost.bind(postsController)
)

// Comments
// @ts-ignore
postsRouter.get('/:postId/comments', likesAuthorisationMiddleware, postsController.getPostComments.bind(postsController))

postsRouter.post('/:postId/comments',
    bearerAuthorisationMiddleware,
    commentContentValidation,
    inputValidationMiddleware,
    postsController.createPostComment.bind(postsController)
)