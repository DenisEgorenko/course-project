import {resolutions} from '../models/videos-models/resolutionsModel';

export type videoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string
    publicationDate: string
    availableResolutions: Array<resolutions>
}

export type blogType = {
    id: string,
    name: string
    description: string,
    websiteUrl: string,
    createdAt: Date
}

export type postType = {
    id: string,
    title: string
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
}


export type dbType = {
    videos: Array<videoType>,
    blogs: Array<blogType>,
    posts: Array<postType>,
}

export const db: dbType = {
    videos: [
        // {
        //     id: +(new Date()),
        //     title: 'Видео',
        //     author: 'John',
        //     canBeDownloaded: false,
        //     minAgeRestriction: null,
        //     createdAt: new Date().toISOString(),
        //     publicationDate: new Date().toISOString(),
        //     availableResolutions: [resolutions.P240, resolutions.P360]
        // },
        // {
        //     id: +(new Date()),
        //     title: 'Видео',
        //     author: 'John',
        //     canBeDownloaded: false,
        //     minAgeRestriction: null,
        //     createdAt: new Date().toISOString(),
        //     publicationDate: new Date().toISOString(),
        //     availableResolutions: [resolutions.P240, resolutions.P360]
        // }
    ],
    blogs: [],
    posts: []
}
