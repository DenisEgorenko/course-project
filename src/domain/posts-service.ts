import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {postTypeDB} from '../database/dbInterface';
import {PostsRepositories} from '../repositories/posts/posts-repositories';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';
import {v4 as uuidv4} from 'uuid';
import {injectable} from 'inversify';
import {LikesModel} from '../models/likes-model/likesModel';


export type updatePostQuery = {
    $set: {
        title: string,
        shortDescription: string,
        content: string,
        blogId: string,
    }
}

export type PostFilterQuery = {
    id: string
}


@injectable()
export class PostsService {

    constructor(protected postsRepositories: PostsRepositories) {

    }

    async createNewPost(requestData: CreatePostInputModel) {
        const newPost: postTypeDB = new postTypeDB(
            uuidv4(),
            requestData.title,
            requestData.shortDescription,
            requestData.content,
            requestData.blogId,
            requestData.blogId,
            new Date(),
            {
                likes: [],
                dislikes: [],
                newestLikes: []
            }
        )

        try {
            await this.postsRepositories.createNewPost(newPost)
            return newPost.id
        } catch (e) {
            return ''
        }
    }

    async updatePost(id: string, updateData: UpdatePostInputModel) {

        const updateQuery: updatePostQuery = {
            $set: {
                title: updateData.title,
                shortDescription: updateData.shortDescription,
                content: updateData.content,
                blogId: updateData.blogId,
            }
        }

        const filterQuery: PostFilterQuery = {
            id: id
        }

        return await this.postsRepositories.updatePost(filterQuery, updateQuery)
    }

    async deletePost(id: string) {
        const filterQuery: PostFilterQuery = {
            id: id
        }
        return await this.postsRepositories.deletePost(filterQuery)
    }

    async setLikeStatus(postId: string, userId: string, likeStatus: LikesModel) {

        if (likeStatus === LikesModel.Like) {
            await this.postsRepositories.setLike(postId, userId)
            return
        }

        if (likeStatus === LikesModel.Dislike) {
            await this.postsRepositories.setDislike(postId, userId)
            return
        }

        if (likeStatus === LikesModel.None) {
            await this.postsRepositories.removeLikeAndDislike(postId, userId)
            return
        }

    }
}

