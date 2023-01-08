import {blogTypeDB} from '../database/dbInterface';
import {CreateBlogInputModel} from '../models/blogs-models/CreateBlogInputModel';
import {blogsRepositories} from '../repositories/blogs/blogs-repositories';
import {UpdateBlogInputModel} from '../models/blogs-models/UpdateBlogInputModel';


export type updateBlogQuery = {
    $set: {
        name: string,
        description: string,
        websiteUrl: string,
    }
}

export type BlogFilterQuery = {
    id: string
}

export const blogsService = {


    async createNewBlog(requestData: CreateBlogInputModel): Promise<string> {

        const newBlog: blogTypeDB = {
            id: (+(new Date())).toString(),
            name: requestData.name,
            description: requestData.description,
            websiteUrl: requestData.websiteUrl,
            createdAt: new Date()
        }

        try {
            await blogsRepositories.createNewBlog(newBlog)
            return newBlog.id
        } catch (e) {
            return ''
        }
    },


    async updateBlog(id: string, updateData: UpdateBlogInputModel): Promise<boolean> {

        const updateQuery: updateBlogQuery = {
            $set: {
                name: updateData.name,
                description: updateData.description,
                websiteUrl: updateData.websiteUrl,
            }
        }

        const filterQuery: BlogFilterQuery = {
            id: id
        }

        return await blogsRepositories.updateBlog(filterQuery, updateQuery)
    },


    async deleteBlog(id: string) {
        const filterQuery: BlogFilterQuery = {
            id: id
        }
        return await blogsRepositories.deleteBlog(filterQuery)
    }


}