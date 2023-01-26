import {CommentsService} from "../domain/comments-service";
import {RequestWithParams, RequestWithParamsAndBody} from "../types/requestTypes";
import {Response} from "express";
import {commentOutputModel, commentsQueryRepositories} from "../repositories/comments/comments-query-repositories";
import {ErrorType, httpStatus} from "../types/responseTypes";
import {commentsURImodel} from "../models/comments-models/commentsURImodel";
import {UpdateCommentInputModel} from "../models/comments-models/UpdateCommentInputModel";
import {CreateLikeInputModel} from "../models/likes-model/createLikeInputModel";
import {LikesModel} from "../models/likes-model/likesModel";
import {injectable} from "inversify";

@injectable()
export class CommentsController {

    constructor(
        protected commentsService: CommentsService
    ) {
    }

    async getCommentById(req: RequestWithParams<commentsURImodel>, res: Response<commentOutputModel>) {
// @ts-ignore
        console.log(req.userId)
        // @ts-ignore
        const foundComment = await commentsQueryRepositories.getCommentById(req.params.commentId, req.userId)

        if (!foundComment) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        res.status(httpStatus.OK_200)
        res.json(foundComment)
    }

    async updateComment(req: RequestWithParamsAndBody<commentsURImodel, UpdateCommentInputModel>, res: Response<ErrorType>) {

        if (!req.params.commentId) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        // @ts-ignore
        const comment = await commentsQueryRepositories.getCommentById(req.params.commentId, req.user.userId)

        if (!comment) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        // @ts-ignore
        if (req.user.userId !== comment.userId) {
            res.sendStatus(httpStatus.FORBIDDEN_403)
            return
        }

        if (!await this.commentsService.updateComment(req.params.commentId, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }
    }

    async deleteComment(req: RequestWithParams<commentsURImodel>, res: Response) {

        if (!req.params.commentId) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        // @ts-ignore
        const comment = await commentsQueryRepositories.getCommentById(req.params.commentId, req.user.userId)

        if (comment === null) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        // @ts-ignore
        if (req.user.userId !== comment.userId) {
            res.sendStatus(httpStatus.FORBIDDEN_403)
            return
        }


        const deleteVideo = await this.commentsService.deleteComment(req.params.commentId)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }

    }

    async setLikes(req: RequestWithParamsAndBody<commentsURImodel, CreateLikeInputModel>, res: Response<ErrorType>) {

        // @ts-ignore
        const comment = await commentsQueryRepositories.getCommentById(req.params.commentId, req.user.userId)

        if (!comment) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        //@ts-ignore
        const likeInfo = await commentsQueryRepositories.getUserLikeInfo(req.user.userId, req.params.commentId)

        if (likeInfo !== LikesModel.Like && req.body.likeStatus === LikesModel.Like) {
            //@ts-ignore
            await this.commentsService.setLikeStatus(req.params.commentId, req.user.userId, req.body.likeStatus)
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        }

        if (likeInfo !== LikesModel.Dislike && req.body.likeStatus === LikesModel.Dislike) {
            //@ts-ignore
            await this.commentsService.setLikeStatus(req.params.commentId, req.user.userId, req.body.likeStatus)
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        }

        if (req.body.likeStatus === LikesModel.None) {
            //@ts-ignore
            await this.commentsService.setLikeStatus(req.params.commentId, req.user.userId, req.body.likeStatus)
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        }

        res.sendStatus(httpStatus.NO_CONTENT_204)
    }
}