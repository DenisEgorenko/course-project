import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {postsDatabase, postTypeDB} from '../database/dbInterface';
import {blogsRepositories} from '../repositories/blogs-repositories';
import {postsRepositories} from '../repositories/posts-repositories';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';
import {BlogFilterQuery, updateBlogQuery} from './blogs-service';


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


export const postsService = {

    async createNewPost(requestData: CreatePostInputModel) {
        const newPost: postTypeDB = {
            id: (+(new Date())).toString(),
            title: requestData.title,
            shortDescription: requestData.shortDescription,
            content: requestData.content,
            blogId: requestData.blogId,
            blogName: requestData.blogId,
            createdAt: new Date()
        }
        try {
            await postsRepositories.createNewPost(newPost)
            return newPost.id
        } catch (e) {
            return ''
        }
    },


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

        return await postsRepositories.updatePost(filterQuery, updateQuery)
    },

    async deletePost(id: string) {
        const filterQuery: PostFilterQuery = {
            id: id
        }
        return await postsRepositories.deletePost(filterQuery)
    }
}