import {Comment, commentsTypeDB} from '../../database/dbInterface';
import {CommentFilterQuery, updateCommentQuery} from '../../domain/comments-service';


export const commentsRepositories = {

    async createNewComment(newComment: commentsTypeDB) {
        try {
            const newCommentEntity = new Comment(newComment)
            await newCommentEntity.save()
            return true
        } catch (e) {
            return false
        }
    },

    async updateComment(filterQuery: CommentFilterQuery, updateQuery: updateCommentQuery) {
        const result = await Comment.updateOne(
            filterQuery,
            updateQuery
        )
        return result.modifiedCount >= 1;
    },

    async deleteComment(filterQuery: CommentFilterQuery): Promise<boolean> {
        const result = await Comment.deleteOne(filterQuery)
        return result.deletedCount >= 1
    },


}
