import {Blog, Comment, Post, postTypeDB} from '../../database/dbInterface';
import {Sort} from 'mongodb';
import {postsQueryModel} from '../../models/posts-models/postsQueryModel';
import {LikesModel} from '../../models/likes-model/likesModel';


export const postsQueryRepositories = {
    async getAllPosts(query: postsQueryModel, userId: string) {

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await Post.countDocuments({})
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await Post.find({}).sort(sort).skip(skip).limit(pageSize);

        return postsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items, userId)
    },

    async getPostById(id: string, userId: string) {
        const foundPost = await Post.find({id})
        if (foundPost[0]) {
            return postToOutputModel(foundPost[0], userId)
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
    },

    async getUserLikeInfo(userId: string, postId: string) {

        const likesInfo = await Post.find({id: postId, 'extendedLikesInfo.likes': userId}).lean()

        if (likesInfo.length) {
            return LikesModel.Like
        }

        const dislikeInfo = await Post.find({id: postId, 'extendedLikesInfo.dislikes': userId}).lean()

        if (dislikeInfo.length) {
            return LikesModel.Dislike
        }

        return LikesModel.None

    }

}

export const postsToOutputModel = (pagesCount: number,
                                   page: number,
                                   pageSize: number,
                                   totalCount: number,
                                   items: postTypeDB[],
                                   userId: string
): postsOutputModel => {

    return {
        pagesCount: pagesCount,
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
        items: items.map(item => postToOutputModel(item, userId))
    }
}

export const postToOutputModel = (post: postTypeDB,
                                  userId: string): postToOutputModel => {
    return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likes.length,
            dislikesCount: post.extendedLikesInfo.dislikes.length,
            myStatus: post.extendedLikesInfo.likes.includes(userId) ? LikesModel.Like
                : post.extendedLikesInfo.dislikes.includes(userId) ? LikesModel.Dislike
                    : LikesModel.None,
            newestLikes: post.extendedLikesInfo.newestLikes
                .sort((a, b) => (a.addedAt > b.addedAt) ? -1 : ((b.addedAt > a.addedAt) ? 1 : 0))
                .map(likeInfo => ({
                    addedAt: likeInfo.addedAt,
                    userId: likeInfo.userId,
                    login: likeInfo.login
                }))
        }
    }
}


export type postsOutputModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: postToOutputModel[]
}


export type postToOutputModel = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date,
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string,
        newestLikes:
            {
                addedAt: Date,
                userId: string,
                login: string
            } []
    }
}
