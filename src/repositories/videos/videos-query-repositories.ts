import {Video, videoTypeDB} from "../../database/dbInterface";
import {resolutions} from "../../models/videos-models/resolutionsModel";

export const videosQueryRepositories = {
    async getAllVideos() {
        const videos = await Video.find({})
        return videos.map(video => (videoToOutputModel(video)))
    },

    async getVideoById(id: string) {
        const foundVideos = await Video.find({id: id})
        if (foundVideos[0]) {
            return videoToOutputModel(foundVideos[0])

        } else {
            return undefined
        }
    }
}

export const videoToOutputModel = (video: videoTypeDB): videoTypeDB => {
    return {
        id: video.id,
        title: video.title,
        author: video.author,
        canBeDownloaded: video.canBeDownloaded,
        minAgeRestriction: video.minAgeRestriction,
        createdAt: video.createdAt,
        publicationDate: video.publicationDate,
        availableResolutions: video.availableResolutions
    }
}


