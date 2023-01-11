import {Post, postTypeDB} from '../../database/dbInterface';
import {PostFilterQuery, updatePostQuery} from '../../domain/posts-service';


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
}
