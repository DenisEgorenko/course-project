import {Blog, blogTypeDB, Post} from '../../database/dbInterface';
import {blogsQueryModel} from '../../models/blogs-models/blogsQueryModel';
import {Sort} from 'mongodb';
import {postsQueryModel} from '../../models/posts-models/postsQueryModel';
import {postsToOutputModel} from '../posts/posts-query-repositories';


export const blogsQueryRepositories = {

    async getAllBlogs(query: blogsQueryModel) {

        const filter = query.searchNameTerm ? {name: new RegExp(query.searchNameTerm, 'i')} : {}

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await Blog.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await Blog.find(filter).sort(sort).skip(skip).limit(pageSize);

        return blogsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getAllBlogsPosts(id: string, query: postsQueryModel) {

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await Post.countDocuments({blogId: id})
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await Post.find({blogId: id}).sort(sort).skip(skip).limit(pageSize);

        return postsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getBlogById(id: string) {
        const foundBlog = await Blog.find({id})
        if (foundBlog[0]) {
            return blogToOutputModel(foundBlog[0])
        } else {
            return undefined
        }

    }

}

export const blogsToOutputModel = (pagesCount: number,
                                   page: number,
                                   pageSize: number,
                                   totalCount: number,
                                   items: blogTypeDB[]
): blogsOutputModel => {

    return {
        pagesCount: pagesCount,
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
        items: items.map(item => blogToOutputModel(item))
    }
}

export const blogToOutputModel = (blog: blogTypeDB): blogTypeDB => {
    return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt
    }
}


export type blogsOutputModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogTypeDB[]
}



