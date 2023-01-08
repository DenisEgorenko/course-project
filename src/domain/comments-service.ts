import {commentsTypeDB} from '../database/dbInterface';
import {CreateCommentInputModel} from '../models/comments-models/CreateCommentInputModel';
import {commentsRepositories} from '../repositories/comments/comments-repositories';
import {authUserOutputModel} from '../repositories/users/users-query-repositories';
import {UpdateCommentInputModel} from '../models/comments-models/UpdateCommentInputModel';


export type updateCommentQuery = {
    $set: {
        content: string,
    }
}

export type CommentFilterQuery = {
    id: string
}


export const CommentsService = {

    async createNewComment(user: authUserOutputModel, postId: string, requestData: CreateCommentInputModel) {
        const newComment: commentsTypeDB = {
            id: (+(new Date())).toString(),
            content: requestData.content,
            userId: user.userId,
            postId: postId,
            userLogin: user.login,
            createdAt: new Date()
        }
        try {
            await commentsRepositories.createNewComment(newComment)
            return newComment.id
        } catch (e) {
            return ''
        }
    },


    async updateComment(id: string, updateData: UpdateCommentInputModel) {

        const updateQuery: updateCommentQuery = {
            $set: {
                content: updateData.content,
            }
        }

        const filterQuery: CommentFilterQuery = {
            id: id
        }

        return await commentsRepositories.updateComment(filterQuery, updateQuery)
    },

    async deleteComment(id: string) {
        const filterQuery: CommentFilterQuery = {
            id: id
        }
        return await commentsRepositories.deleteComment(filterQuery)
    }
}