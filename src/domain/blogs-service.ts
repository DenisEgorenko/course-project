import {blogTypeDB} from '../database/dbInterface';
import {CreateBlogInputModel} from '../models/blogs-models/CreateBlogInputModel';
import {blogsRepositories} from '../repositories/blogs/blogs-repositories';
import {UpdateBlogInputModel} from '../models/blogs-models/UpdateBlogInputModel';
import {v4 as uuidv4} from 'uuid';

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


class BlogsService {
    async createNewBlog(requestData: CreateBlogInputModel): Promise<string> {

        const newBlog: blogTypeDB = new blogTypeDB(
            uuidv4(),
            requestData.name,
            requestData.description,
            requestData.websiteUrl,
            new Date()
        )

        try {
            await blogsRepositories.createNewBlog(newBlog)
            return newBlog.id
        } catch (e) {
            return ''
        }
    }

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
    }

    async deleteBlog(id: string) {
        const filterQuery: BlogFilterQuery = {
            id: id
        }
        return await blogsRepositories.deleteBlog(filterQuery)
    }
}

export const blogsService = new BlogsService()