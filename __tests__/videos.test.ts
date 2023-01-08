import request from 'supertest'
import {app} from '../src';
import {createVideoInputModel} from '../src/models/videos-models/CreateVideoInputModel';
import {httpStatus} from '../src/types/responseTypes';
import {UpdateVideoInputModel} from '../src/models/videos-models/UpdateVideoInputModel';
import {resolutions} from '../src/models/videos-models/resolutionsModel';
import {Video, videoTypeDB} from '../src/database/dbInterface';


describe('Video CRUD tests', function () {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(httpStatus.NO_CONTENT_204)
    })

    it('DB should empty', async function () {
        expect(await Video.find({})).toEqual([])
    });

    // Create

    let createdVideo1: videoTypeDB
    let createdVideo2: videoTypeDB

    it('should add video to DB', async function () {

        const newVideo: createVideoInputModel = {
            title: 'Новое Видео',
            author: 'Новый Автор',
            availableResolutions: [resolutions.P360, resolutions.P480]
        }

        const newVideo2: createVideoInputModel = {
            title: 'Новое Видео2',
            author: 'Новый Автор2',
            availableResolutions: [resolutions.P1080, resolutions.P144]
        }

        const response = await request(app)
            .post('/videos')
            .send(newVideo)
            .expect(httpStatus.CREATED_201)

        const response2 = await request(app)
            .post('/videos')
            .send(newVideo2)
            .expect(httpStatus.CREATED_201)

        expect(response.body).toEqual(
            {
                id: expect.any(String),
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

    it('should return error because of wrong resolution', async function () {

        const newVideoWithMistake: createVideoInputModel = {
            title: 'Новое Видео2',
            author: 'Новый Автор2',
            // @ts-ignore
            availableResolutions: [resolutions.P1080, 'invalid']
        }

        const response = await request(app)
            .post('/videos')
            .send(newVideoWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    it('should return error because of wrong title', async function () {

        const newVideoWithMistake: createVideoInputModel = {
            title: '',
            author: 'Новый Автор2',
            availableResolutions: [resolutions.P1080]
        }

        const newVideoWithMistakeLength: createVideoInputModel = {
            title: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop',
            author: 'Новый Автор2',
            availableResolutions: [resolutions.P1080]
        }

        await request(app)
            .post('/videos')
            .send(newVideoWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .post('/videos')
            .send(newVideoWithMistakeLength)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    it('should return error because of wrong author', async function () {

        const newVideoWithMistake: createVideoInputModel = {
            title: 'Новое видео',
            author: '',
            availableResolutions: [resolutions.P1080]
        }

        const newVideoWithMistakeLength: createVideoInputModel = {
            title: 'Новое видео',
            author: 'qwertyuiopqwertyuiopqwertyuiop',
            availableResolutions: [resolutions.P1080]
        }

        await request(app)
            .post('/videos')
            .send(newVideoWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .post('/videos')
            .send(newVideoWithMistakeLength)
            .expect(httpStatus.BAD_REQUEST_400)

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

    it('should return error if video does not exist', async function () {
        const videoById = await request(app)
            .get(`/videos/5555`)
            .expect(httpStatus.NOT_FOUND_404)
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

    it('video should not be updated because of wrong title', async function () {

        const dataForUpdateWithMistake: UpdateVideoInputModel = {
            title: '',
            author: 'Новое имя',
            canBeDownloaded: true,
            minAgeRestriction: 5,
            publicationDate: new Date().toISOString()
        }

        const dataForUpdateWithMistakeLength: UpdateVideoInputModel = {
            title: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop',
            author: 'Новое имя',
            canBeDownloaded: true,
            minAgeRestriction: 5,
            publicationDate: new Date().toISOString()
        }

        await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistakeLength)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    it('video should not be updated because of wrong author', async function () {

        const dataForUpdateWithMistake: UpdateVideoInputModel = {
            title: 'Новый заголовок',
            author: '',
            canBeDownloaded: true,
            minAgeRestriction: 5,
            publicationDate: new Date().toISOString()
        }

        const dataForUpdateWithMistakeLength: UpdateVideoInputModel = {
            title: 'Новый заголовок',
            author: 'йцукенгшщзйцукенгшщзйцукенгшщзйцукенгшщз',
            canBeDownloaded: true,
            minAgeRestriction: 5,
            publicationDate: new Date().toISOString()
        }

        await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistakeLength)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    it('video should not be updated because of wrong age restriction', async function () {

        const dataForUpdateWithMistake: UpdateVideoInputModel = {
            title: 'Новый заголовок',
            author: 'Новый заголовок',
            canBeDownloaded: true,
            minAgeRestriction: 0,
            publicationDate: new Date().toISOString()
        }

        const dataForUpdateWithMistakeHighAge: UpdateVideoInputModel = {
            title: 'Новый заголовок',
            author: 'Новый заголовок',
            canBeDownloaded: true,
            minAgeRestriction: 19,
            publicationDate: new Date().toISOString()
        }

        await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistakeHighAge)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    it('video should not be updated because of wrong resolution', async function () {

        const dataForUpdateWithMistake: UpdateVideoInputModel = {
            title: 'Новый заголовок',
            author: 'Новый заголовок',

            // @ts-ignore
            availableResolutions: [resolutions.P1080, 'invalid'],
            publicationDate: new Date().toISOString()
        }

        await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    it('video should not be updated because of wrong canBeDownloaded', async function () {

        const dataForUpdateWithMistake: UpdateVideoInputModel = {
            title: 'Новый заголовок',
            author: 'Новый заголовок',

            // @ts-ignore
            canBeDownloaded: 'not valid',
            publicationDate: new Date().toISOString()
        }

        const res = await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    it('video should not be updated because of wrong publicationDate', async function () {

        const dataForUpdateWithMistake: UpdateVideoInputModel = {
            title: 'Новый заголовок',
            author: 'Новый заголовок',

            publicationDate: 'new Date().toISOString()'
        }

        const res = await request(app)
            .put(`/videos/${createdVideo2.id}`)
            .send(dataForUpdateWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    //Delete

    it('should delete Video', async function () {
        await request(app)
            .delete(`/videos/${createdVideo1.id}`)
            .expect(httpStatus.NO_CONTENT_204)

        const res = await Video.find({})
        expect(res.length).toBe(1)
    });

    it('should not delete Video if wrong id', async function () {
        await request(app)
            .delete(`/videos/kkk`)
            .expect(httpStatus.NOT_FOUND_404)
    });

});
