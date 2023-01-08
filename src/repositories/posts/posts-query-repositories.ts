import {Blog, Post, postTypeDB} from '../../database/dbInterface';
import {Sort} from 'mongodb';
import {postsQueryModel} from '../../models/posts-models/postsQueryModel';


export const postsQueryRepositories = {
    async getAllPosts(query: postsQueryModel) {

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await Post.countDocuments({})
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await Post.find({}).sort(sort).skip(skip).limit(pageSize);

        return postsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getPostById(id: string) {
        const foundPost = await Post.find({id})
        if (foundPost[0]) {
            return postToOutputModel(foundPost[0])
        } else {
            return undefined
        }
    },


    async ifBlogIdExist(value: string): Promise<boolean> {
        const blogs = await Blog.find({});
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
        items: items.map(item => postToOutputModel(item))
    }
}

export const postToOutputModel = (post: postTypeDB): postTypeDB => {
    return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt
    }
}


export type postsOutputModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: postTypeDB[]
}

