import {dataBase} from './db';
import {resolutions} from '../models/videos-models/resolutionsModel';


export const postsDatabase = dataBase.collection<postTypeDB>('posts')
export const blogsDatabase = dataBase.collection<blogTypeDB>('blogs')
export const videosDatabase = dataBase.collection<videoTypeDB>('videos')
export const usersDatabase = dataBase.collection<userTypeDB>('users')
export const commentsDatabase = dataBase.collection<commentsTypeDB>('comments')
export const securityDevicesDatabase = dataBase.collection<securityDevicesTypeDB>('securityDevices')


export type blogTypeDB = {
    id: string,
    name: string
    description: string,
    websiteUrl: string,
    createdAt: Date
}

export type postTypeDB = {
    id: string,
    title: string
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
}


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
        expirationDate: Date,
        isConfirmed: boolean
    }
}

export type commentsTypeDB = {
    id: string,
    content: string,
    userId: string,
    postId: string,
    userLogin: string,
    createdAt: Date
}

export type videoTypeDB = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string
    publicationDate: string
    availableResolutions: Array<resolutions>
}

export type securityDevicesTypeDB = {
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string,
    userId: string
}