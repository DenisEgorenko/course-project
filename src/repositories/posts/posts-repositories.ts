import {Comment, Post, postTypeDB} from '../../database/dbInterface';
import {PostFilterQuery, updatePostQuery} from '../../domain/posts-service';
import {injectable} from 'inversify';
import {usersQueryRepositories} from '../../features/users/infrastructure/users-query-repositories';
import {postsQueryRepositories} from './posts-query-repositories';

@injectable()
export class PostsRepositories {

    async createNewPost(newPost: postTypeDB) {
        try {
            const newPostEntity = new Post(newPost)
            await newPostEntity.save()
            return true
        } catch (e) {
            return false
        }
    }

    async updatePost(filterQuery: PostFilterQuery, updateQuery: updatePostQuery) {
        const result = await Post.updateOne(
            filterQuery,
            updateQuery
        )
        return result.modifiedCount >= 1;
    }

    async deletePost(filterQuery: PostFilterQuery): Promise<boolean> {
        const result = await Post.deleteOne(filterQuery)
        return result.deletedCount >= 1
    }

    async setLike(postId: string, userId: string): Promise<boolean> {

        const setLike = await Post.updateMany({id: postId},

            {$push: {'extendedLikesInfo.likes': `${userId}`}}
            // {$pull: {'likesInfo.dislikes': `${userId}`}}
        )

        const unsetDislike = await Post.updateOne({id: postId},
            {$pull: {'extendedLikesInfo.dislikes': `${userId}`}}
        )

        const user = await usersQueryRepositories.getUserById(userId)

        const addLastLike = await Post.updateOne({id: postId},
            {
                $push: {
                    'extendedLikesInfo.newestLikes': {
                        addedAt: new Date(),
                        userId: userId,
                        login: user.login
                    }
                }
            }
        )

        const postInfo = await postsQueryRepositories.getPostById(postId, userId)

        if (postInfo && postInfo.extendedLikesInfo.newestLikes.length > 3) {
            const deleteLastLike = await Post.updateOne({id: postId},
                {$pop: {'extendedLikesInfo.newestLikes': -1}}
            )
        }

        return setLike.modifiedCount >= 1 && addLastLike.modifiedCount >= 1 || unsetDislike.modifiedCount >= 1;
    }

    async setDislike(postId: string, userId: string): Promise<boolean> {

        const setDislike = await Post.updateOne({id: postId},
            {$push: {'extendedLikesInfo.dislikes': `${userId}`}}
        )

        const unsetLike = await Post.updateOne({id: postId},

            {$pull: {'extendedLikesInfo.likes': `${userId}`}}
            // {$pull: {'likesInfo.dislikes': `${userId}`}}
        )

        const deleteLastLike = await Post.updateOne({id: postId},
            {$pull: {'extendedLikesInfo.newestLikes': {userId: `${userId}`}}}
        )

        return setDislike.modifiedCount >= 1 && deleteLastLike.modifiedCount >= 1 || unsetLike.modifiedCount >= 1;
    }

    async removeLikeAndDislike(postId: string, userId: string
    ): Promise<boolean> {

        const unsetDislike = await Post.updateOne({id: postId},
            {$pull: {'extendedLikesInfo.dislikes': `${userId}`}}
        )

        const unsetLike = await Post.updateOne({id: postId},
            {$pull: {'extendedLikesInfo.likes': `${userId}`}}
        )

        const deleteLastLike = await Post.updateOne({id: postId},
            {$pull: {'extendedLikesInfo.newestLikes': {userId: `${userId}`}}}
        )

        return unsetDislike.modifiedCount >= 1 && deleteLastLike.modifiedCount >= 1 || unsetLike.modifiedCount >= 1;
    }
}
