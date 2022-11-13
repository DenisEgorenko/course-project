import request from 'supertest'
import {app, db, resolutions, videoType} from "../src";
import {createVideoInputModel} from "../src/models/CreateVideoInputModel";
import {httpStatus} from "../src/types/responseTypes";
import {UpdateVideoInputModel} from "../src/models/UpdateVideoInputModel";

describe('Video CRUD tests', function () {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(httpStatus.NO_CONTENT_204)
    })

    it('DB should empty', function () {
        expect(db.videos).toEqual([])
    });

    // Create

    let createdVideo1: videoType
    let createdVideo2: videoType

    it('should add video to DB', async function () {

        const newVideo: createVideoInputModel = {
            title: "Новое Видео",
            author: 'Новый Автор',
            availableResolutions: [resolutions.P360, resolutions.P480]
        }

        const newVideo2: createVideoInputModel = {
            title: "Новое Видео2",
            author: 'Новый Автор2',
            availableResolutions: [resolutions.P1080, resolutions.P144]
        }

        const response = await request(app)
            .post('/videos')
            .send(newVideo)
            .expect(200)

        const response2 = await request(app)
            .post('/videos')
            .send(newVideo)
            .expect(httpStatus.OK_200)

        expect(response.body).toEqual(
            {
                id: expect.any(Number),
                title: newVideo.title,
                author: newVideo.author,
                canBeDownloaded: false,
                minAgeRestriction: null,
                createdAt: expect.any(String),
                publicationDate: expect.any(String),
                availableResolutions: newVideo.availableResolutions
            }
        )

        createdVideo1 = response.body
        createdVideo2 = response2.body

    });

    // Read


    it('should return all videos', async function () {
        const allVideos = await request(app)
            .get('/videos')
            .expect(httpStatus.OK_200)


        expect(allVideos.body.length).toBe(2)
        expect(allVideos.body[0].title).toBe(createdVideo1.title)
        expect(allVideos.body[1].title).toBe(createdVideo2.title)
    });

    it('should return video by id', async function () {
        const videoById = await request(app)
            .get(`/videos/${createdVideo1.id}`)
            .expect(httpStatus.OK_200)

        expect(videoById.body.title).toBe(createdVideo1.title)
    });


    //Update

    it('video should be updated', async function () {
        const dataForUpdate: UpdateVideoInputModel = {
            title: 'Обновленный заголовок',
            author: 'Новое имя',
            canBeDownloaded: true,
            minAgeRestriction: 5,
            publicationDate: new Date().toISOString()
        }

        await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdate)
            .expect(httpStatus.NO_CONTENT_204)

        const videoById = await request(app)
            .get(`/videos/${createdVideo2.id}`)
            .expect(httpStatus.OK_200)

        expect(videoById.body.title).toBe(dataForUpdate.title)
    });


    //Delete

    it('should delete Video', async function () {
        await request(app)
            .delete(`/videos/${createdVideo1.id}`)
            .expect(httpStatus.NO_CONTENT_204)

        expect(db.videos.length).toBe(1)
    });

});
