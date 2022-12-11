import {commentsDatabase, commentsTypeDB, postsDatabase} from '../../database/dbInterface';
import {PostFilterQuery, updatePostQuery} from '../../domain/posts-service';
import {CommentFilterQuery, updateCommentQuery} from '../../domain/comments-service';


export const commentsRepositories = {

    async createNewComment(newComment: commentsTypeDB) {
        try {
            await commentsDatabase.insertOne({...newComment})
            return true
        } catch (e) {
            return false
        }
    },

    async updateComment(filterQuery: CommentFilterQuery, updateQuery: updateCommentQuery) {
        const result = await commentsDatabase.updateOne(
            filterQuery,
            updateQuery
        )
        return result.modifiedCount >= 1;
    },

    async deleteComment(filterQuery: CommentFilterQuery): Promise<boolean> {
        const result = await commentsDatabase.deleteOne(filterQuery)
        return result.deletedCount >= 1
    },


}
