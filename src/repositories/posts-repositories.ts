import {db, postType} from './dataBase';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';


export const postsRepositories = {
    async getAllPosts() {
        return db.posts
    },

    async getPostById(id: string) {
        const foundPost = db.posts.filter(post => post.id === id)
        return foundPost[0]
    },

    async createNewPost(requestData: CreatePostInputModel) {

        const newPost: postType = {
            id: (+(new Date())).toString(),
            title: requestData.title,
            shortDescription: requestData.shortDescription,
            content: requestData.content,
            blogId: requestData.blogId,
            blogName: ''
        }

        db.posts.push(newPost)

        return newPost
    },

    async updatePost(id: string, updateData: UpdatePostInputModel) {

        const post = db.posts.find(post => post.id === id)

        if (!post) {
            return false;
        }

        post.title = updateData.title
        post.shortDescription = updateData.shortDescription
        post.content = updateData.content
        post.blogId = updateData.blogId

        db.posts = db.posts.map(post => post.id === id ? {...post, ...updateData} : post)

        return true
    },

    async deletePost(id: string): Promise<boolean> {
        const foundPost = db.posts.filter(post => post.id === id)

        if (!foundPost.length) {
            return false
        } else {
            db.posts = db.posts.filter(post => post.id !== id)
            return true
        }
    },

    async ifBlogIdExist(value: string): Promise<boolean> {
        if (db.blogs.some(blog => (blog.id === value))){
            return Promise.resolve(true)
        }else {
            return Promise.reject(false)
        }
    }
}
