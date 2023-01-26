import {commentsTypeDB} from '../database/dbInterface';
import {CreateCommentInputModel} from '../models/comments-models/CreateCommentInputModel';
import {CommentsRepositories} from '../repositories/comments/comments-repositories';
import {authUserOutputModel} from '../features/users/infrastructure/users-query-repositories';
import {UpdateCommentInputModel} from '../models/comments-models/UpdateCommentInputModel';
import {v4 as uuidv4} from 'uuid';
import {LikesModel} from "../models/likes-model/likesModel";
import {injectable} from "inversify";

export type updateCommentQuery = {
    $set: {
        content: string,
    }
}

export type updateCommentLikeInfoQuery = {
    $set: {
        content: string,
    }
}

export type CommentFilterQuery = {
    id: string
}


@injectable()
export class CommentsService {

    constructor(protected commentsRepositories: CommentsRepositories) {
    }

    async createNewComment(user: authUserOutputModel, postId: string, requestData: CreateCommentInputModel) {
        const newComment: commentsTypeDB = new commentsTypeDB(
            uuidv4(),
            requestData.content,
            user.userId,
            postId,
            user.login,
            new Date(),
            {
                likes: [],
                dislikes: []
            }
        )

        try {
            await this.commentsRepositories.createNewComment(newComment)
            return newComment.id
        } catch (e) {
            return ''
        }
    }

    async updateComment(id: string, updateData: UpdateCommentInputModel) {

        const updateQuery: updateCommentQuery = {
            $set: {
                content: updateData.content,
            }
        }

        const filterQuery: CommentFilterQuery = {
            id: id
        }

        return await this.commentsRepositories.updateComment(filterQuery, updateQuery)
    }

    async deleteComment(id: string) {
        const filterQuery: CommentFilterQuery = {
            id: id
        }
        return await this.commentsRepositories.deleteComment(filterQuery)
    }

    async setLikeStatus(commentId: string, userId: string, likeStatus: LikesModel) {

        if (likeStatus === LikesModel.Like) {
            await this.commentsRepositories.setLike(commentId, userId)
            return
        }

        if (likeStatus === LikesModel.Dislike) {
            await this.commentsRepositories.setDislike(commentId, userId)
            return
        }

        if (likeStatus === LikesModel.None) {
            await this.commentsRepositories.removeLikeAndDislike(commentId, userId)
            return
        }

    }
}

