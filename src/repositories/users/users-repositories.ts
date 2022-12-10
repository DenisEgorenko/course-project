import {CreatePostInputModel} from '../../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../../models/posts-models/UpdatePostInputModel';
import {blogsDatabase, postsDatabase, postTypeDB, usersDatabase, userTypeDB} from '../../database/dbInterface';
import {PostFilterQuery, updatePostQuery} from '../../domain/posts-service';
import {UserFilterQuery} from '../../domain/users-service';


export const usersRepositories = {

    async createNewUser(newUser: userTypeDB) {
        try {
            await  usersDatabase.insertOne({...newUser})
            return true
        } catch (e) {
            return false
        }
    },

    async deleteUser(filterQuery: UserFilterQuery): Promise<boolean> {
        const result = await usersDatabase.deleteOne(filterQuery)
        return result.deletedCount >= 1
    },


}
