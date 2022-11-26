import {UpdateBlogInputModel} from '../models/blogs-models/UpdateBlogInputModel';
import {CreateBlogInputModel} from '../models/blogs-models/CreateBlogInputModel';
import {blogType} from './dataBase';
import {dataBase} from '../database/db';


export const blogsDatabase = dataBase.collection<blogType>('blogs')


export const blogsRepositories = {
    async getAllBlogs() {
        return blogsDatabase.find({}).toArray();
    },

    async getBlogById(id: string) {
        const foundBlog = await blogsDatabase.find({id: id}).toArray()
        return foundBlog[0]
    },

    async createNewBlog(requestData: CreateBlogInputModel) {

        const newBlog: blogType = {
            id: (+(new Date())).toString(),
            name: requestData.name,
            description: requestData.description,
            websiteUrl: requestData.websiteUrl,
            createdAt: new Date()
        }

        await blogsDatabase.insertOne(newBlog)

        return newBlog
    },

    async updateBlog(id: string, updateData: UpdateBlogInputModel) {

        console.log(id, typeof id)

        const result = await blogsDatabase.updateOne(
            {id: id},
            {
                $set: {
                    name: updateData.name,
                    description: updateData.description,
                    websiteUrl: updateData.websiteUrl,
                }
            })

        return result.modifiedCount >= 1;
    },

    async deleteBlog(id: string) {
        const result = await blogsDatabase.deleteOne({id: id})
        return result.deletedCount >= 1
    }

}