import request from 'supertest'
import {app} from '../src';
import {httpStatus} from '../src/types/responseTypes';
import {db, postType} from '../src/repositories/dataBase';
import {CreateBlogInputModel} from '../src/models/blogs-models/CreateBlogInputModel';
import {UpdateBlogInputModel} from '../src/models/blogs-models/UpdateBlogInputModel';
import {CreatePostInputModel} from '../src/models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../src/models/posts-models/UpdatePostInputModel';


const authToken = 'YWRtaW46cXdlcnR5'

describe('Posts CRUD tests', function () {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(httpStatus.NO_CONTENT_204)
    })

    it('DB should empty', function () {
        expect(db.posts).toEqual([])
    });

    // Create

    let createdPost1: postType
    let createdPost2: postType

    it('should add post to DB', async function () {

        const newBlog: CreatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: 'Короткое описание',
            content: 'Контент',
            blogId: 'ID блога'
        }

        const newBlog2: CreatePostInputModel = {
            title: 'Заголовок поста 2',
            shortDescription: 'Короткое описание 2',
            content: 'Контент 2',
            blogId: 'ID блога 2'
        }

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlog)
            .expect(httpStatus.CREATED_201)

        const response2 = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${authToken}`)
            .send(newBlog2)
            .expect(httpStatus.CREATED_201)

        expect(response.body).toEqual(
            {
                id: expect.any(String),
                title: 'Заголовок поста',
                shortDescription: 'Короткое описание',
                content: 'Контент',
                blogId: 'ID блога',
                blogName: ''
            }
        )
        createdPost1 = response.body
        createdPost2 = response2.body
    });

    it('should return error because of wrong title', async function () {

        const newPostWithMistake: CreatePostInputModel = {
            title: '',
            shortDescription: 'Короткое описание',
            content: 'Контент',
            blogId: 'ID блога'
        }

        const newPostWithMistakeEmpty: CreatePostInputModel = {
            title: '          ',
            shortDescription: 'Короткое описание',
            content: 'Контент',
            blogId: 'ID блога'
        }

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${authToken}`)
            .send(newPostWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)

        const response1 = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${authToken}`)
            .send(newPostWithMistakeEmpty)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    it('should return error because of wrong shortDescription', async function () {

        const newPostWithMistake: CreatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: '',
            content: 'Контент',
            blogId: 'ID блога'
        }

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${authToken}`)
            .send(newPostWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    it('should return error because of wrong content', async function () {

        const newPostWithMistake: CreatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: 'Короткое описание',
            content: '',
            blogId: 'ID блога'
        }

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${authToken}`)
            .send(newPostWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    it('should return error because of wrong blogId', async function () {

        const newPostWithMistake: CreatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: 'Короткое описание',
            content: 'Контент',
            blogId: ''
        }

        const response = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${authToken}`)
            .send(newPostWithMistake)
            .expect(httpStatus.BAD_REQUEST_400)
    });

    // Read

    it('should return all posts', async function () {
        const allBlogs = await request(app)
            .get('/posts')
            .expect(httpStatus.OK_200)


        expect(allBlogs.body.length).toBe(2)
        expect(allBlogs.body[0].title).toBe(createdPost1.title)
        expect(allBlogs.body[1].title).toBe(createdPost2.title)
    });

    it('should return post by id', async function () {
        const postById = await request(app)
            .get(`/posts/${createdPost1.id}`)
            .expect(httpStatus.OK_200)

        expect(postById.body.title).toBe(createdPost1.title)
    });

    it('should return error if post does not exist', async function () {
        const videoById = await request(app)
            .get(`/posts/5555`)
            .expect(httpStatus.NOT_FOUND_404)
    });


    //Update

    it('blog should be updated', async function () {
        const dataForUpdate: UpdatePostInputModel = {
            title: 'Заголовок поста обновленный',
            shortDescription: 'описание обновленное',
            content: 'Контент обновленный',
            blogId: 'ID блога обновленный'
        }

        await request(app)
            .put(`/posts/${createdPost1.id}`)
            .send(dataForUpdate)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.NO_CONTENT_204)

        const videoById = await request(app)
            .get(`/posts/${createdPost1.id}`)
            .expect(httpStatus.OK_200)

        expect(videoById.body.title).toBe(dataForUpdate.title)
    });


    it('blog should not be updated because of wrong title', async function () {

        const dataForUpdateWithMistake: UpdatePostInputModel = {
            title: '',
            shortDescription: 'описание обновленное',
            content: 'Контент обновленный',
            blogId: 'ID блога обновленный'
        }

        const dataForUpdateWithMistakeLength: UpdatePostInputModel = {
            title: '12345678910123456789101234567891012345678910',
            shortDescription: 'описание обновленное',
            content: 'Контент обновленный',
            blogId: 'ID блога обновленный'
        }

        await request(app)
            .put(`/posts/${createdPost1.id}`)
            .send(dataForUpdateWithMistake)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .put(`/posts/${createdPost2.id}`)
            .send(dataForUpdateWithMistakeLength)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

    });


    it('blog should not be updated because of wrong shortDescription', async function () {

        const dataForUpdateWithMistake: UpdatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: '',
            content: 'Контент обновленный',
            blogId: 'ID блога обновленный'
        }

        const dataForUpdateWithMistakeLength: UpdatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: '123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910',
            content: 'Контент обновленный',
            blogId: 'ID блога обновленный'
        }

        await request(app)
            .put(`/posts/${createdPost1.id}`)
            .send(dataForUpdateWithMistake)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .put(`/posts/${createdPost2.id}`)
            .send(dataForUpdateWithMistakeLength)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    it('blog should not be updated because of wrong content', async function () {

        const dataForUpdateWithMistake: UpdatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: 'описание',
            content: '',
            blogId: 'ID блога обновленный'
        }

        const dataForUpdateWithMistakeLength: UpdatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: 'описание',
            content: '123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910123456789101234567891012345678910',
            blogId: 'ID блога обновленный'
        }

        await request(app)
            .put(`/posts/${createdPost1.id}`)
            .send(dataForUpdateWithMistake)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

        await request(app)
            .put(`/posts/${createdPost2.id}`)
            .send(dataForUpdateWithMistakeLength)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

    });


    it('blog should not be updated because of wrong blogId', async function () {

        const dataForUpdateWithMistake: UpdatePostInputModel = {
            title: 'Заголовок поста',
            shortDescription: 'описание',
            content: 'Контент',
            blogId: ''
        }

        await request(app)
            .put(`/posts/${createdPost1.id}`)
            .send(dataForUpdateWithMistake)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.BAD_REQUEST_400)

    });

    // //Delete

    it('should delete post', async function () {
        await request(app)
            .delete(`/posts/${createdPost1.id}`)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.NO_CONTENT_204)

        expect(db.posts.length).toBe(1)
    });

    it('should not delete Video if wrong id', async function () {
        await request(app)
            .delete(`/posts/kkk`)
            .set('Authorization', `Basic ${authToken}`)
            .expect(httpStatus.NOT_FOUND_404)
    });

});
