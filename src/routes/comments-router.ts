import {Router} from 'express';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {bearerAuthorisationMiddleware} from '../middlewares/bearer-uthorisation-middleware';
import {container} from "../composition-root";
import {LikesModel} from "../models/likes-model/likesModel";
import {likesAuthorisationMiddleware} from "../middlewares/likes-authorisation-middleware";
import {CommentsController} from "../controllers/comments-controller";

export const CommentsRouter = Router({})


export const commentContentValidation = body('content').trim().isLength({
    min: 20,
    max: 300
}).withMessage('Request should consist comment content with length more than 20 less than 301')


export const likesBodyValidation = body('likeStatus')
    .trim()
    .isIn(Object.keys(LikesModel))
    .withMessage('Request should consist right values for likes')

// Controller

const commentsController = container.resolve(CommentsController)

// Router
// Read Comments

CommentsRouter.get('/:commentId', likesAuthorisationMiddleware, commentsController.getCommentById.bind(commentsController))

// Update Comment
CommentsRouter.put('/:commentId',
    bearerAuthorisationMiddleware,
    commentContentValidation,
    inputValidationMiddleware,
    commentsController.updateComment.bind(commentsController)
)

// Delete Comment
CommentsRouter.delete('/:commentId',
    bearerAuthorisationMiddleware,
    inputValidationMiddleware,
    commentsController.deleteComment.bind(commentsController)
)

// Likes
CommentsRouter.put('/:commentId/like-status',
    bearerAuthorisationMiddleware,
    likesBodyValidation,
    inputValidationMiddleware,
    commentsController.setLikes.bind(commentsController)
)
