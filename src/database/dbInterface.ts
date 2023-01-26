import {resolutions} from '../models/videos-models/resolutionsModel';
import mongoose, {Model} from 'mongoose';


// types

export class blogTypeDB {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public websiteUrl: string,
        public createdAt: Date
    ) {
    }
}

export class postTypeDB {
    constructor(
        public id: string,
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
        public createdAt: Date,
        public extendedLikesInfo: {
            likes: string[],
            dislikes: string[],
            newestLikes: {
                addedAt: Date,
                userId: string,
                login: string
            } []
        }
    ) {
    }
}

export class userTypeDB {
    constructor(
        public accountData: {
            id: string,
            login: string,
            email: string,
            password: string,
            salt: string,
            refreshToken: string | null,
            createdAt: Date
        },
        public emailConfirmation: {
            confirmationCode: string | null,
            expirationDate: Date | null,
            isConfirmed: boolean
        },
        public passwordRecovery: {
            recoveryCode: string | null,
            expirationDate: Date | null,
        }
    ) {
    }
}

export class commentsTypeDB {
    constructor(
        public id: string,
        public content: string,
        public userId: string,
        public postId: string,
        public userLogin: string,
        public createdAt: Date,
        public likesInfo: {
            likes: string[],
            dislikes: string[]
        }
    ) {
    }
}

export class videoTypeDB {
    constructor(
        public id: string,
        public title: string,
        public author: string,
        public canBeDownloaded: boolean,
        public minAgeRestriction: number | null,
        public createdAt: string,
        public publicationDate: string,
        public availableResolutions: Array<resolutions>
    ) {
    }
}

export class securityDevicesTypeDB {
    constructor(
        public ip: string,
        public title: string,
        public lastActiveDate: Date,
        public deviceId: string,
        public userId: string
    ) {
    }
}

// mongoose

const blogSchema = new mongoose.Schema<blogTypeDB>({
    id: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: Date, required: true}
})
export const Blog = mongoose.model('blogs', blogSchema)

const postSchema = new mongoose.Schema<postTypeDB>({
    id: {type: String, required: true},
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: Date, required: true},
    extendedLikesInfo: {
        likes: {type: [String], required: true},
        dislikes: {type: [String], required: true},
        newestLikes: {
            type: [{
                addedAt: Date,
                userId: String,
                login: String
            }], required: true
        }
    }
})
export const Post = mongoose.model('posts', postSchema)


export type UserAccountDBMethodsType = {
    canBeConfirmed: () => boolean
}
type userModelType = Model<userTypeDB, {}, UserAccountDBMethodsType>
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
export const User = mongoose.model<userTypeDB, userModelType>('users', userSchema)


const commentSchema = new mongoose.Schema<commentsTypeDB>({
    id: {type: String, required: true},
    content: {type: String, required: true},
    userId: {type: String, required: true},
    postId: {type: String, required: true},
    userLogin: {type: String, required: true},
    createdAt: {type: Date, required: true},
    likesInfo: {
        likes: {type: [String], required: true},
        dislikes: {type: [String], required: true}
    }
})
export const Comment = mongoose.model('comments', commentSchema)

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

const securityDeviceSchema = new mongoose.Schema<securityDevicesTypeDB>({
    ip: {type: String, required: true},
    title: {type: String, required: true},
    lastActiveDate: {type: Date, required: true},
    deviceId: {type: String, required: true},
    userId: {type: String, required: true}
})
export const securityDevice = mongoose.model('securityDevices', securityDeviceSchema)