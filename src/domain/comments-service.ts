import {commentsTypeDB} from '../database/dbInterface';
import {CreateCommentInputModel} from '../models/comments-models/CreateCommentInputModel';
import {commentsRepositories} from '../repositories/comments/comments-repositories';
import {authUserOutputModel} from '../repositories/users/users-query-repositories';
import {UpdateCommentInputModel} from '../models/comments-models/UpdateCommentInputModel';
import {v4 as uuidv4} from 'uuid';

export type updateCommentQuery = {
    $set: {
        content: string,
    }
}

export type CommentFilterQuery = {
    id: string
}

class CommentsService {
    async createNewComment(user: authUserOutputModel, postId: string, requestData: CreateCommentInputModel) {
        const newComment: commentsTypeDB = new commentsTypeDB(
            uuidv4(),
            requestData.content,
            user.userId,
            postId,
            user.login,
            new Date()
        )

        try {
            await commentsRepositories.createNewComment(newComment)
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

        return await commentsRepositories.updateComment(filterQuery, updateQuery)
    }

    async deleteComment(id: string) {
        const filterQuery: CommentFilterQuery = {
            id: id
        }
        return await commentsRepositories.deleteComment(filterQuery)
    }
}

export const commentsService = new CommentsService()