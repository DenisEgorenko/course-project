import {Request, Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from '../types/requestTypes';
import {videoURImodel} from '../models/videos-models/videoURImodel';
import {UpdateVideoInputModel} from '../models/videos-models/UpdateVideoInputModel';
import {videosRepositories} from '../repositories/videos-repositories';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {blogType} from '../repositories/dataBase';
import {blogsRepositories} from '../repositories/blogs-repositories';
import {CreateBlogInputModel} from '../models/blogs-models/CreateBlogInputModel';
import {blogsURImodel} from '../models/blogs-models/blogsURImodel';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {UpdateBlogInputModel} from '../models/blogs-models/UpdateBlogInputModel';

export const blogsRouter = Router({})


const blogNameValidation = body('name').trim().isLength({
    min: 1,
    max: 15
}).withMessage('Request should consist title with length less than 15')


const blogDescriptionValidation = body('description').trim().isLength({
    min: 1,
    max: 500
}).withMessage('Request should consist description with length less than 500')

const UrlValidation = body('websiteUrl').isLength({
    min: 1,
    max: 100
}).matches(`^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$`).withMessage('Request should consist websiteUrl')


// Read
blogsRouter.get('/', (req: Request, res: Response<Array<blogType>>) => {
    res.status(httpStatus.OK_200)
    res.json(blogsRepositories.getAllBlogs())
})

blogsRouter.get('/:id', (req: RequestWithParams<blogsURImodel>, res: Response<blogType>) => {

    const foundBlog = blogsRepositories.getBlogById(req.params.id)

    if (!foundBlog) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    res.status(httpStatus.OK_200)
    res.json(foundBlog)
})

// Create videos
blogsRouter.post('/',
    authorisationMiddleware,
    blogNameValidation,
    blogDescriptionValidation,
    UrlValidation,
    inputValidationMiddleware,
    (req: RequestWithBody<CreateBlogInputModel>, res: Response<ErrorType | blogType>) => {

        res.status(httpStatus.CREATED_201)
        res.json(blogsRepositories.createNewBlog(req.body))
    })

// Update Videos
blogsRouter.put('/:id',
    authorisationMiddleware,
    blogNameValidation,
    blogDescriptionValidation,
    UrlValidation,
    inputValidationMiddleware,
    (req: RequestWithParamsAndBody<blogsURImodel, UpdateBlogInputModel>, res: Response<ErrorType>) => {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        if (!blogsRepositories.updateBlog(req.params.id, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }
    })

// Delete Videos
blogsRouter.delete('/:id',
    authorisationMiddleware,
    inputValidationMiddleware,
    (req: RequestWithParams<blogsURImodel>, res: Response) => {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteVideo = blogsRepositories.deleteBlog(req.params.id)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }

    })
