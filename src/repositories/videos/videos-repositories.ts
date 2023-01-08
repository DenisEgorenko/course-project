import {createVideoInputModel} from '../../models/videos-models/CreateVideoInputModel';
import {UpdateVideoInputModel} from '../../models/videos-models/UpdateVideoInputModel';
import {Video, videoTypeDB} from '../../database/dbInterface';
import {v4 as uuidv4} from 'uuid';

export const videosRepositories = {

    async createNewVideo(requestData: createVideoInputModel) {
        const publicationDate = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()

        const newVideo: videoTypeDB = {
            id: uuidv4(),
            title: requestData.title,
            author: requestData.author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: new Date().toISOString(),
            publicationDate: publicationDate,
            availableResolutions: requestData.availableResolutions
        }

        const newVideoEntity = new Video(newVideo)

        await newVideoEntity.save()

        return newVideo
    },

    async updateVideo(id: string, updateData: UpdateVideoInputModel) {

        const result = await Video.updateOne(
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

    async deleteVideo(id: string) {
        const result = await Video.deleteOne({id: id})
        return result.deletedCount >= 1
    }

}