import {Request, Response, Router} from 'express';
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
import {postsRepositories} from '../repositories/posts/posts-repositories';
import {postsURImodel} from '../models/posts-models/postsURImodel';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';
import {postsOutputModel, postsQueryRepositories} from '../repositories/posts/posts-query-repositories';
import {commentsTypeDB, postTypeDB} from '../database/dbInterface';
import {postsService} from '../domain/posts-service';
import {blogsService} from '../domain/blogs-service';
import {blogsQueryRepositories} from '../repositories/blogs/blogs-query-repositories';
import {postsQueryModel} from '../models/posts-models/postsQueryModel';
import {commentsURImodel} from '../models/comments-models/commentsURImodel';
import {
    commentOutputModel,
    commentsOutputModel,
    commentsQueryRepositories
} from '../repositories/comments/comments-query-repositories';
import {CommentsService} from '../domain/comments-service';
import {bearerAuthorisationMiddleware} from '../middlewares/bearer-uthorisation-middleware';
import {CreateCommentInputModel} from '../models/comments-models/CreateCommentInputModel';
import {usersService} from '../domain/users-service';
import {usersQueryRepositories} from '../repositories/users/users-query-repositories';
import {commentsQueryModel} from '../models/comments-models/commentsQueryModel';
import {UpdateCommentInputModel} from '../models/comments-models/UpdateCommentInputModel';

export const CommentsRouter = Router({})


export const commentContentValidation = body('content').trim().isLength({
    min: 20,
    max: 300
}).withMessage('Request should consist comment content with length more than 20 less than 301')

// Comments
// Read Comments

CommentsRouter.get('/:id', async (req: RequestWithParams<postsURImodel>, res: Response<commentOutputModel>) => {

    const foundComment = await commentsQueryRepositories.getCommentById(req.params.id)

    if (!foundComment) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    res.status(httpStatus.OK_200)
    res.json(foundComment)
})

// Update Comment
CommentsRouter.put('/:postId',
    bearerAuthorisationMiddleware,
    commentContentValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<commentsURImodel, UpdateCommentInputModel>, res: Response<ErrorType>) => {

        if (!req.params.postId) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        if (!await CommentsService.updateComment(req.params.postId, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }
    })

// Delete Comment
CommentsRouter.delete('/:postId',
    bearerAuthorisationMiddleware,
    inputValidationMiddleware,
    async (req: RequestWithParams<commentsURImodel>, res: Response) => {

        if (!req.params.postId) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteVideo = await CommentsService.deleteComment(req.params.postId)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }

    })

