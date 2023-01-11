import {Comment, commentsTypeDB} from '../../database/dbInterface';
import {Sort} from 'mongodb';
import {commentsQueryModel} from '../../models/comments-models/commentsQueryModel';
import {LikesModel} from "../../models/likes-model/likesModel";


export const commentsQueryRepositories = {
    async getAllPostComments(postId: string, query: commentsQueryModel, userId: string) {

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await Comment.countDocuments({postId: postId})
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await Comment.find({postId: postId}).sort(sort).skip(skip).limit(pageSize);

        return commentsToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items, userId)
    },

    async getCommentById(id: string, userId: string) {
        const foundComment = await Comment.find({id: id})

        if (foundComment.length) {
            return commentToOutputModel(foundComment[0], userId)
        } else {
            return null
        }
    },

    async getUserLikeInfo(userId: string, commentId: string) {

        const likesInfo = await Comment.find({id: commentId, 'likesInfo.likes': userId}).lean()

        if (likesInfo.length) {
            return LikesModel.Like
        }

        const dislikeInfo = await Comment.find({id: commentId, 'likesInfo.dislikes': userId}).lean()

        if (dislikeInfo.length) {
            return LikesModel.Dislike
        }

        return LikesModel.None

    }
}

export const commentsToOutputModel = (pagesCount: number,
                                      page: number,
                                      pageSize: number,
                                      totalCount: number,
                                      items: commentsTypeDB[],
                                      userId: string
): commentsOutputModel => {

    return {
        pagesCount: pagesCount,
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
        items: items.map(comment => commentToOutputModel(comment, userId))
    }
}


export const commentToOutputModel = (item: commentsTypeDB,
                                     userId: string
): commentOutputModel => {

    // const likeStatus

    return {
        id: item.id,
        content: item.content,
        userId: item.userId,
        userLogin: item.userLogin,
        createdAt: item.createdAt,
        likesInfo: {
            likesCount: item.likesInfo.likes.length,
            dislikesCount: item.likesInfo.dislikes.length,
            myStatus: item.likesInfo.likes.includes(userId) ? LikesModel.Like
                : item.likesInfo.dislikes.includes(userId) ? LikesModel.Dislike : LikesModel.None
        }
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
    createdAt: Date,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikesModel
    }
}

