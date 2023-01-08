import {resolutions} from '../models/videos-models/resolutionsModel';
import mongoose from "mongoose";


// export const postsDatabase = dataBase.collection<postTypeDB>('posts')
// export const videosDatabase = dataBase.collection<videoTypeDB>('videos')
// export const usersDatabase = dataBase.collection<userTypeDB>('users')
// export const commentsDatabase = dataBase.collection<commentsTypeDB>('comments')
// export const securityDevicesDatabase = dataBase.collection<securityDevicesTypeDB>('securityDevices')


export type blogTypeDB = {
    id: string,
    name: string
    description: string,
    websiteUrl: string,
    createdAt: Date
}
const blogSchema = new mongoose.Schema<blogTypeDB>({
    id: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: Date, required: true}
})
export const Blog = mongoose.model('blogs', blogSchema)

export type postTypeDB = {
    id: string,
    title: string
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
}
const postSchema = new mongoose.Schema<postTypeDB>({
    id: {type: String, required: true},
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: Date, required: true}
})
export const Post = mongoose.model('posts', postSchema)

export type userTypeDB = {
    accountData: {
        id: string,
        login: string,
        email: string,
        password: string,
        salt: string,
        refreshToken: string | null,
        createdAt: Date
    },
    emailConfirmation: {
        confirmationCode: string | null,
        expirationDate: Date | null,
        isConfirmed: boolean
    },
    passwordRecovery: {
        recoveryCode: string | null,
        expirationDate: Date | null,
    }
}
const userSchema = new mongoose.Schema<userTypeDB>({
    accountData: {
        id: {type: String, required: true},
        login: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        salt: {type: String, required: true},
        refreshToken: {type: String, required: false},
        createdAt: {type: Date, required: true}
    },
    emailConfirmation: {
        confirmationCode: {type: String, required: false},
        expirationDate: {type: Date, required: false},
        isConfirmed: {type: Boolean, required: false}
    },
    passwordRecovery: {
        recoveryCode: {type: String, required: false},
        expirationDate: {type: Date, required: false},
    }
})
export const User = mongoose.model('users', userSchema)

export type commentsTypeDB = {
    id: string,
    content: string,
    userId: string,
    postId: string,
    userLogin: string,
    createdAt: Date
}
const commentSchema = new mongoose.Schema<commentsTypeDB>({
    id: {type: String, required: true},
    content: {type: String, required: true},
    userId: {type: String, required: true},
    postId: {type: String, required: true},
    userLogin: {type: String, required: true},
    createdAt: {type: Date, required: true}
})
export const Comment = mongoose.model('comments', commentSchema)

export type videoTypeDB = {
    id: string,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string
    publicationDate: string
    availableResolutions: Array<resolutions>
}
const videoSchema = new mongoose.Schema<videoTypeDB>({
    id: {type: String, required: true},
    title: {type: String, required: true},
    author: {type: String, required: true},
    canBeDownloaded: {type: Boolean, required: true},
    minAgeRestriction: {type: Number, required: false},
    createdAt: {type: String, required: true},
    publicationDate: {type: String, required: true},
    availableResolutions: {type: [String], enum: resolutions, required: true}
})
export const Video = mongoose.model('videos', videoSchema)

export type securityDevicesTypeDB = {
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string,
    userId: string
}
const securityDeviceSchema = new mongoose.Schema<securityDevicesTypeDB>({
    ip: {type: String, required: true},
    title: {type: String, required: true},
    lastActiveDate: {type: Date, required: true},
    deviceId: {type: String, required: true},
    userId: {type: String, required: true}
})
export const securityDevice = mongoose.model('securityDevices', securityDeviceSchema)