import {createVideoInputModel} from '../models/videos-models/CreateVideoInputModel';
import {UpdateVideoInputModel} from '../models/videos-models/UpdateVideoInputModel';
import {db, videoType} from './dataBase';


export const videosRepositories = {
    getAllVideos() {
        return db.videos
    },

    getVideoById(id: number) {
        const foundVideos = db.videos.filter(video => video.id === id)
        return foundVideos[0]
    },

    createNewVideo(requestData: createVideoInputModel) {
        const publicationDate = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()

        const newVideo: videoType = {
            id: +(new Date()),
            title: requestData.title,
            author: requestData.author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: new Date().toISOString(),
            publicationDate: publicationDate,
            availableResolutions: requestData.availableResolutions
        }

        db.videos.push(newVideo)

        return newVideo
    },

    updateVideo(id: number, updateData: UpdateVideoInputModel) {
        const video = db.videos.find(video => video.id === +id)

        if (!video) {
            return false;
        }

        video.title = updateData.title
        video.author = updateData.author

        if (updateData.canBeDownloaded) {
            video.canBeDownloaded = updateData.canBeDownloaded
        }

        if (updateData.minAgeRestriction) {
            video.minAgeRestriction = updateData.minAgeRestriction
        }

        if (updateData.publicationDate) {
            video.publicationDate = updateData.publicationDate
        }

        if (updateData.availableResolutions) {
            video.availableResolutions = updateData.availableResolutions
        }

        db.videos = db.videos.map(video => video.id === id ? {...video, ...updateData} : video)

        return true
    },

    deleteVideo(id: number) {
        const foundVideo = db.videos.filter(video => video.id === +id)

        if (!foundVideo.length) {
            return false
        } else {
            db.videos = db.videos.filter(video => video.id !== +id)
            return true
        }
    }

}