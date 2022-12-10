import {UpdateBlogInputModel} from '../../models/blogs-models/UpdateBlogInputModel';
import {CreateBlogInputModel} from '../../models/blogs-models/CreateBlogInputModel';
import {blogsDatabase, blogTypeDB} from '../../database/dbInterface';
import {BlogFilterQuery, updateBlogQuery} from '../../domain/blogs-service';


export const blogsRepositories = {

    async createNewBlog(newBlog: blogTypeDB) {

        try {
            await blogsDatabase.insertOne({...newBlog})
            return true
        } catch (e) {
            return false
        }
    },

    async updateBlog(filterQuery: BlogFilterQuery, updateQuery: updateBlogQuery): Promise<boolean> {
        const result = await blogsDatabase.updateOne(
            filterQuery,
            updateQuery
        )

        return result.modifiedCount >= 1;
    },

    async deleteBlog(filter: BlogFilterQuery) {
        const result = await blogsDatabase.deleteOne(filter)
        return result.deletedCount >= 1
    }

}