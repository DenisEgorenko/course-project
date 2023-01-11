import {Comment, commentsTypeDB} from '../../database/dbInterface';
import {CommentFilterQuery, updateCommentLikeInfoQuery, updateCommentQuery} from '../../domain/comments-service';


export class CommentsRepositories {

    async createNewComment(newComment: commentsTypeDB) {
        try {
            const newCommentEntity = new Comment(newComment)
            await newCommentEntity.save()
            return true
        } catch (e) {
            return false
        }
    }

    async updateComment(filterQuery: CommentFilterQuery, updateQuery: updateCommentQuery) {
        const result = await Comment.updateOne(
            filterQuery,
            updateQuery
        )
        return result.modifiedCount >= 1;
    }

    async deleteComment(filterQuery: CommentFilterQuery): Promise<boolean> {
        const result = await Comment.deleteOne(filterQuery)
        return result.deletedCount >= 1
    }

    async setLike(commentId: string, userId: string): Promise<boolean> {

        const setLike = await Comment.updateOne({id: commentId},

            {$push: {'likesInfo.likes': `${userId}`}}
            // {$pull: {'likesInfo.dislikes': `${userId}`}}
        )

        const unsetDislike = await Comment.updateOne({id: commentId},
            {$pull: {'likesInfo.dislikes': `${userId}`}}
        )

        return setLike.modifiedCount >= 1 || unsetDislike.modifiedCount >= 1;
    }

    async setDislike(commentId: string, userId: string): Promise<boolean> {

        const setDislike = await Comment.updateOne({id: commentId},
            {$push: {'likesInfo.dislikes': `${userId}`}}
        )

        const unsetLike = await Comment.updateOne({id: commentId},

            {$pull: {'likesInfo.likes': `${userId}`}}
            // {$pull: {'likesInfo.dislikes': `${userId}`}}
        )

        return setDislike.modifiedCount >= 1 || unsetLike.modifiedCount >= 1;
    }

    async removeLikeAndDislike(commentId: string, userId: string): Promise<boolean> {

        const unsetDislike = await Comment.updateOne({id: commentId},
            {$pull: {'likesInfo.dislikes': `${userId}`}}
        )

        const unsetLike = await Comment.updateOne({id: commentId},
            {$pull: {'likesInfo.likes': `${userId}`}}
        )

        return unsetDislike.modifiedCount >= 1 || unsetLike.modifiedCount >= 1;
    }

}
