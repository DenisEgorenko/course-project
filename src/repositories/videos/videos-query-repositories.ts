import {videosDatabase} from '../../database/dbInterface';

export const videosQueryRepositories = {
    async getAllVideos() {
        return videosDatabase.find({}, {projection:{ _id: 0 }}).toArray();
    },

    async getVideoById(id: number) {
        const foundVideos = await videosDatabase.find({id: id}, {projection:{ _id: 0 }}).toArray()
        return foundVideos[0]
    }
}


