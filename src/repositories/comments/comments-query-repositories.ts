import {Comment, commentsTypeDB} from '../../database/dbInterface';
import {Sort} from 'mongodb';
import {commentsQueryModel} from '../../models/comments-models/commentsQueryModel';


export const commentsQueryRepositories = {
    async getAllPostComments(postId: string, query: commentsQueryModel) {

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await Comment.countDocuments({postId: postId})
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await Comment.find({postId: postId}).sort(sort).skip(skip).limit(pageSize);

        return commentsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getCommentById(id: string) {
        const foundComment = await Comment.find({id: id})

        if (foundComment.length) {
            return commentToOutputModel(foundComment[0])
        } else {
            return null
        }
    }
}

export const commentsToOutputModel = (pagesCount: number,
                                      page: number,
                                      pageSize: number,
                                      totalCount: number,
                                      items: commentsTypeDB[]
): commentsOutputModel => {

    return {
        pagesCount: pagesCount,
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
        items: items.map(comment => commentToOutputModel(comment))
    }
}


export const commentToOutputModel = (item: commentsTypeDB
): commentOutputModel => {

    return {
        id: item.id,
        content: item.content,
        userId: item.userId,
        userLogin: item.userLogin,
        createdAt: item.createdAt
    }
}


export type commentsOutputModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: commentOutputModel[]
}

export type commentOutputModel = {
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: Date
}

