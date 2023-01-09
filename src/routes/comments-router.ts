import {Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {RequestWithParams, RequestWithParamsAndBody} from '../types/requestTypes';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {postsURImodel} from '../models/posts-models/postsURImodel';
import {commentsURImodel} from '../models/comments-models/commentsURImodel';
import {commentOutputModel, commentsQueryRepositories} from '../repositories/comments/comments-query-repositories';
import {commentsService} from '../domain/comments-service';
import {bearerAuthorisationMiddleware} from '../middlewares/bearer-uthorisation-middleware';
import {UpdateCommentInputModel} from '../models/comments-models/UpdateCommentInputModel';

export const CommentsRouter = Router({})


export const commentContentValidation = body('content').trim().isLength({
    min: 20,
    max: 300
}).withMessage('Request should consist comment content with length more than 20 less than 301')


// Controller

class CommentsController {
    async getCommentById(req: RequestWithParams<postsURImodel>, res: Response<commentOutputModel>) {

        const foundComment = await commentsQueryRepositories.getCommentById(req.params.id)

        if (!foundComment) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        res.status(httpStatus.OK_200)
        res.json(foundComment)
    }

    async updateComment(req: RequestWithParamsAndBody<commentsURImodel, UpdateCommentInputModel>, res: Response<ErrorType>) {

        if (!req.params.postId) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const comment = await commentsQueryRepositories.getCommentById(req.params.postId)

        if (comment === null) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        // @ts-ignore
        if (req.user.userId !== comment.userId) {
            res.sendStatus(httpStatus.FORBIDDEN_403)
            return
        }

        if (!await commentsService.updateComment(req.params.postId, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }
    }

    async deleteComment(req: RequestWithParams<commentsURImodel>, res: Response) {

        if (!req.params.postId) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const comment = await commentsQueryRepositories.getCommentById(req.params.postId)

        if (comment === null) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        // @ts-ignore
        if (req.user.userId !== comment.userId) {
            res.sendStatus(httpStatus.FORBIDDEN_403)
            return
        }


        const deleteVideo = await commentsService.deleteComment(req.params.postId)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }

    }
}

const commentsControllerInstance = new CommentsController()


// Router
// Read Comments

CommentsRouter.get('/:id', commentsControllerInstance.getCommentById)

// Update Comment
CommentsRouter.put('/:postId',
    bearerAuthorisationMiddleware,
    commentContentValidation,
    inputValidationMiddleware,
    commentsControllerInstance.updateComment
)

// Delete Comment
CommentsRouter.delete('/:postId',
    bearerAuthorisationMiddleware,
    inputValidationMiddleware,
    commentsControllerInstance.deleteComment
)

