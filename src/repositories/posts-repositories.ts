import {db, postType} from './dataBase';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';


export const postsRepositories = {
    getAllPosts() {
        return db.posts
    },

    getPostById(id: string) {
        const foundPost = db.posts.filter(post => post.id === id)
        return foundPost[0]
    },

    createNewPost(requestData: CreatePostInputModel) {

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

    updatePost(id: string, updateData: UpdatePostInputModel) {

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

    deletePost(id: string) {
        const foundPost = db.posts.filter(post => post.id === id)

        if (!foundPost.length) {
            return false
        } else {
            db.posts = db.posts.filter(post => post.id !== id)
            return true
        }
    },

    ifBlogIdExist(value: string) {
        return db.blogs.some(blog => (blog.id === value));
    }
}
