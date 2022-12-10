import {CreatePostInputModel} from '../../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../../models/posts-models/UpdatePostInputModel';
import {blogsDatabase, postsDatabase, postTypeDB} from '../../database/dbInterface';
import {PostFilterQuery, updatePostQuery} from '../../domain/posts-service';


export const postsRepositories = {

    async createNewPost(newPost: postTypeDB) {
        try {
            await postsDatabase.insertOne({...newPost})
            return true
        } catch (e) {
            return false
        }
    },

    async updatePost(filterQuery: PostFilterQuery, updateQuery: updatePostQuery) {
        const result = await postsDatabase.updateOne(
            filterQuery,
            updateQuery
        )
        return result.modifiedCount >= 1;
    },

    async deletePost(filterQuery: PostFilterQuery): Promise<boolean> {
        const result = await postsDatabase.deleteOne(filterQuery)
        return result.deletedCount >= 1
    },


}
