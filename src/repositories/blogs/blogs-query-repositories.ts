import {blogsDatabase, blogTypeDB, postsDatabase} from '../../database/dbInterface';
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

        const totalCount = await blogsDatabase.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await blogsDatabase.find(filter, {projection: {_id: 0}}).sort(sort).skip(skip).limit(pageSize).toArray();

        return blogsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getAllBlogsPosts(id: string, query: postsQueryModel) {

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await postsDatabase.countDocuments({blogId: id})
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await postsDatabase.find({blogId: id}, {projection: {_id: 0}}).sort(sort).skip(skip).limit(pageSize).toArray();

        return postsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getBlogById(id: string) {
        const foundBlog = await blogsDatabase.find({id: id}, {projection: {_id: 0}}).toArray()
        return foundBlog[0]
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
        items: items
    }
}


export type blogsOutputModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogTypeDB[]
}



