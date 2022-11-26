import {UpdateBlogInputModel} from '../models/blogs-models/UpdateBlogInputModel';
import {CreateBlogInputModel} from '../models/blogs-models/CreateBlogInputModel';
import {blogType, db} from './dataBase';


export const blogsRepositories = {
    async getAllBlogs() {
        return db.blogs;
    },

    async getBlogById(id: string) {
        const foundBlog = db.blogs.filter(blog => blog.id === id)
        return foundBlog[0]
    },

    async createNewBlog(requestData: CreateBlogInputModel) {

        const newBlog: blogType = {
            id: (+(new Date())).toString(),
            name: requestData.name,
            description: requestData.description,
            websiteUrl: requestData.websiteUrl
        }

        db.blogs.push(newBlog)

        return newBlog
    },

    async updateBlog(id: string, updateData: UpdateBlogInputModel) {

        const blog = db.blogs.find(blog => blog.id === id)

        if (!blog) {
            return false;
        }

        blog.name = updateData.name
        blog.description = updateData.description
        blog.websiteUrl = updateData.websiteUrl

        db.blogs = db.blogs.map(blog => blog.id === id ? {...blog, ...updateData} : blog)

        return true
    },

    async deleteBlog(id: string) {
        const foundBlog = db.blogs.filter(blog => blog.id === id)

        if (!foundBlog.length) {
            return false
        } else {
            db.blogs = db.blogs.filter(blog => blog.id !== id)
            return true
        }
    }

}