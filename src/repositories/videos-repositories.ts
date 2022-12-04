import {createVideoInputModel} from '../models/videos-models/CreateVideoInputModel';
import {UpdateVideoInputModel} from '../models/videos-models/UpdateVideoInputModel';
import {videosDatabase, videoTypeDB} from '../database/dbInterface';


export const videosRepositories = {

    async createNewVideo(requestData: createVideoInputModel) {
        const publicationDate = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()

        const newVideo: videoTypeDB = {
            id: +(new Date()),
            title: requestData.title,
            author: requestData.author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: new Date().toISOString(),
            publicationDate: publicationDate,
            availableResolutions: requestData.availableResolutions
        }

        await videosDatabase.insertOne({...newVideo})

        return newVideo
    },

    async updateVideo(id: number, updateData: UpdateVideoInputModel) {

        const result = await videosDatabase.updateOne(
            {id: id},
            {
                $set: {
                    title: updateData.title,
                    author: updateData.author,
                    canBeDownloaded: updateData.canBeDownloaded,
                    minAgeRestriction: updateData.minAgeRestriction,
                    publicationDate: updateData.publicationDate,
                    availableResolutions: updateData.availableResolutions
                }
            })
        return result.modifiedCount >= 1;
    },

    async deleteVideo(id: number) {
        const result = await videosDatabase.deleteOne({id: id})
        return result.deletedCount >= 1
    }

}