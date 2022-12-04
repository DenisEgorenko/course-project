import {blogsDatabase, blogTypeDB, postsDatabase, postTypeDB} from '../database/dbInterface';
import {Sort} from 'mongodb';
import {postsQueryModel} from '../models/posts-models/postsQueryModel';


export const postsQueryRepositories = {
    async getAllPosts(query: postsQueryModel) {

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await postsDatabase.countDocuments({})
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await postsDatabase.find({}, {projection: {_id: 0}}).sort(sort).skip(skip).limit(pageSize).toArray();

        return postsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getPostById(id: string) {
        const foundPost = await postsDatabase.find({id: id}, {projection: {_id: 0}}).toArray()
        return foundPost[0]
    },


    async ifBlogIdExist(value: string): Promise<boolean> {

        const blogs = await blogsDatabase.find({}).toArray();
        if (blogs.some(blog => (blog.id === value))) {
            return Promise.resolve(true)
        } else {
            return Promise.reject(false)
        }
    }

}

export const postsToOutputModel = (pagesCount: number,
                            page: number,
                            pageSize: number,
                            totalCount: number,
                            items: postTypeDB[]
): postsOutputModel => {

    return {
        pagesCount: pagesCount,
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
        items: items
    }
}


export type postsOutputModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: postTypeDB[]
}

