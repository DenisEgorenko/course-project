import request from 'supertest'
import {app} from '../src';
import {createVideoInputModel} from '../src/models/videos-models/CreateVideoInputModel';
import {httpStatus} from '../src/types/responseTypes';
import {UpdateVideoInputModel} from '../src/models/videos-models/UpdateVideoInputModel';
import {blogType, db} from '../src/repositories/dataBase';
import {resolutions} from '../src/models/videos-models/resolutionsModel';
import {CreateBlogInputModel} from '../src/models/blogs-models/CreateBlogInputModel';
import {UpdateBlogInputModel} from '../src/models/blogs-models/UpdateBlogInputModel';
import {blogsDatabase} from '../src/repositories/blogs-repositories';


const authToken = 'YWRtaW46cXdlcnR5'

describe('Blogs CRUD tests', function () {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(httpStatus.NO_CONTENT_204)
    })

    it('DB should empty', async function () {
        expect(await blogsDatabase.find({}).toArray()).toEqual([])
    });

    // Create

    let createdBlog1: blogType
    let createdBlog2: blogType

    it('should add blogs to DB', async function () {

        const newBlog: CreateBlogInputModel = {
            name: 'Имя блога 1',
            description: 'Описание 1',
            websiteUrl: 'https://www.example.com'
        }

        const newBlog2: CreateBlogInputModel = {
            name: 'Имя блога 2',
            description: 'Описание 2',
            websiteUrl: 'https://www.example.com'
        }

        const response = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlog)
            .expect(httpStatus.CREATED_201)

        const response2 = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlog2)
            .expect(httpStatus.CREATED_201)

        expect(response.body).toEqual(
            {
                _id: expect.any(String),
                id: expect.any(String),
                name: newBlog.name,
                description: newBlog.description,
                websiteUrl: newBlog.websiteUrl,
                createdAt: expect.any(String)
            }
        )
        createdBlog1 = response.body
        createdBlog2 = response2.body
    });

    it('should return error because of wrong name', async function () {

        const newBlogWithMistake: CreateBlogInputModel = {
            name: 'qwertyuiopqwertyuiop',
            description: 'Описание 1',
            websiteUrl: 'https://www.example.com'
        }

        const newBlogWithMistakeEmpty: CreateBlogInputModel = {
            name: '          ',
            description: 'Описание 1',
            websiteUrl: 'https://www.example.com'
        }

        const response = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlogWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)


        const response2 = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlogWithMistakeEmpty)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    it('should return error because of wrong description', async function () {

        const newBlogWithMistake: CreateBlogInputModel = {
            name: 'dddd',
            description: '',
            websiteUrl: 'https://www.example.com'
        }

        const response = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlogWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    it('should return error because of wrong URL', async function () {

        const newBlogWithMistake: CreateBlogInputModel = {
            name: 'dddd',
            description: 'ddd',
            websiteUrl: 'https/www.example.com'
        }

        const newBlogWithMistakeShort: CreateBlogInputModel = {
            name: 'dddd',
            description: 'ddd',
            websiteUrl: 'https/www.example.com'
        }

        const response = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlogWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

        const response1 = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlogWithMistakeShort)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    // Read

    it('should return all blogs', async function () {
        const allBlogs = await request(app)
            .get('/blogs')
            .expect(httpStatus.OK_200)


        console.log(allBlogs.body)

        expect(allBlogs.body.length).toBe(2)
        expect(allBlogs.body[0].name).toBe(createdBlog1.name)
        expect(allBlogs.body[1].name).toBe(createdBlog2.name)
    });

    it('should return blog by id', async function () {
        const videoById = await request(app)
            .get(`/blogs/${createdBlog1.id}`)
            .expect(httpStatus.OK_200)

        expect(videoById.body.name).toBe(createdBlog1.name)
    });

    it('should return error if blog does not exist', async function () {
        const videoById = await request(app)
            .get(`/blogs/5555`)
            .expect(httpStatus.NOT_FOUND_404)
    });


    //Update

    it('blog should be updated', async function () {
        const dataForUpdate: UpdateBlogInputModel = {
            name: 'string',
            description: 'string',
            websiteUrl: 'https://www.example.com'
        }

        await request(app)
            .put(`/blogs/${createdBlog1.id}`)
            .send(dataForUpdate)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.NO_CONTENT_204)

        const videoById = await request(app)
            .get(`/blogs/${createdBlog1.id}`)
            .expect(httpStatus.OK_200)

        expect(videoById.body.name).toBe(dataForUpdate.name)
    });


    it('blog should not be updated because of wrong name', async function () {

        const dataForUpdateWithMistake: UpdateBlogInputModel = {
            name: '',
            description: 'string',
            websiteUrl: 'https://www.example.com'
        }

        const dataForUpdateWithMistakeLength: UpdateBlogInputModel = {
            name: 'qwertyuiopqwertyuiopqwertyuiop',
            description: 'string',
            websiteUrl: 'https://www.example.com'
        }

        await request(app)
            .put(`/blogs/${createdBlog1.id}`)
            .send(dataForUpdateWithMistake)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .put(`/blogs/${createdBlog1.id}`)
            .send(dataForUpdateWithMistakeLength)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

    });


    it('blog should not be updated because of wrong description', async function () {

        const dataForUpdateWithMistake: UpdateBlogInputModel = {
            name: 'hhh',
            description: '',
            websiteUrl: 'https://www.example.com'
        }

        await request(app)
            .put(`/blogs/${createdBlog1.id}`)
            .send(dataForUpdateWithMistake)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    it('blog should not be updated because of wrong URL', async function () {

        const dataForUpdateWithMistake: UpdateBlogInputModel = {
            name: 'hhh',
            description: 'ddd',
            websiteUrl: 'string'
        }

        await request(app)
            .put(`/blogs/${createdBlog1.id}`)
            .send(dataForUpdateWithMistake)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    // //Delete

    it('should delete blog', async function () {
        await request(app)
            .delete(`/blogs/${createdBlog1.id}`)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.NO_CONTENT_204)

        const res = await blogsDatabase.find({}).toArray()

        expect(res.length).toBe(1)
    });

    it('should not delete Video if wrong id', async function () {
        await request(app)
            .delete(`/blogs/kkk`)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.NOT_FOUND_404)
    });

});
