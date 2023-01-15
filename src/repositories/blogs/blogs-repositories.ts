import {Blog, blogTypeDB} from '../../database/dbInterface';
import {BlogFilterQuery, updateBlogQuery} from '../../domain/blogs-service';
import {injectable} from "inversify";

@injectable()
export class BlogsRepositories {

    async createNewBlog(newBlog: blogTypeDB) {

        const newBlogModel = new Blog(newBlog)
        try {
            await newBlogModel.save()
            return true
        } catch (e) {
            return false
        }
    }

    async updateBlog(filterQuery: BlogFilterQuery, updateQuery: updateBlogQuery): Promise<boolean> {
        const result = await Blog.updateOne(
            filterQuery,
            updateQuery
        )

        return result.modifiedCount >= 1;
    }

    async deleteBlog(filter: BlogFilterQuery) {
        const result = await Blog.deleteOne(filter)
        return result.deletedCount >= 1
    }

}