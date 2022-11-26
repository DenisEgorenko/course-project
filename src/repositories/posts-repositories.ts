import {postType} from './dataBase';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';
import {dataBase} from '../database/db';
import {blogsDatabase} from './blogs-repositories';


export const postsDatabase = dataBase.collection<postType>('posts')


export const postsRepositories = {
    async getAllPosts() {
        return postsDatabase.find({}).toArray();
    },

    async getPostById(id: string) {
        const foundPost = await postsDatabase.find({id: id}).toArray()
        return foundPost[0]
    },

    async createNewPost(requestData: CreatePostInputModel) {

        const newPost: postType = {
            id: (+(new Date())).toString(),
            title: requestData.title,
            shortDescription: requestData.shortDescription,
            content: requestData.content,
            blogId: requestData.blogId,
            blogName: '',
            createdAt: new Date()
        }

        const copyPost = {...newPost}

        await postsDatabase.insertOne(newPost)

        return copyPost
    },

    async updatePost(id: string, updateData: UpdatePostInputModel) {

        const result = await postsDatabase.updateOne(
            {id: id},
            {
                $set: {
                    title: updateData.title,
                    shortDescription: updateData.shortDescription,
                    content: updateData.content,
                    blogId: updateData.blogId,
                }
            })

        return result.modifiedCount >= 1;
    },

    async deletePost(id: string): Promise<boolean> {
        const result = await postsDatabase.deleteOne({id: id})
        return result.deletedCount >= 1
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
