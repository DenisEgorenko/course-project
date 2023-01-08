import {Request, Response, Router} from 'express';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from '../types/requestTypes';
import {videoURImodel} from '../models/videos-models/videoURImodel';
import {createVideoInputModel} from '../models/videos-models/CreateVideoInputModel';
import {UpdateVideoInputModel} from '../models/videos-models/UpdateVideoInputModel';
import {videosRepositories} from '../repositories/videos/videos-repositories';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {resolutions} from '../models/videos-models/resolutionsModel';
import {videosQueryRepositories} from '../repositories/videos/videos-query-repositories';
import {videoTypeDB} from '../database/dbInterface';

export const videosRouter = Router({})


const titleValidation = body('title').isLength({
    min: 1,
    max: 40
}).withMessage('Request should consist title with length less than 40')

const authorValidation = body('author').isLength({
    min: 1,
    max: 20
}).withMessage('author is required or longer than 20')

const ageRestrictionValidation = body('minAgeRestriction').optional().isInt({
    min: 1,
    max: 18
}).withMessage('age should be more than 1 and less than 19')


const canBeDownloadedValidation = body('canBeDownloaded').optional().isBoolean().withMessage('Invalid canBeDownloaded')

const availableResolutionsValidation = body('availableResolutions').optional().isArray().custom(value => (
    !value.some((resolution: string) => !Object.keys(resolutions).includes(resolution))
)).withMessage('Invalid availableResolutions')


const availableResolutionsValidationRequired = body('availableResolutions').isArray().custom(value => (
    !value.some((resolution: string) => !Object.keys(resolutions).includes(resolution))
)).withMessage('Invalid availableResolutions')

const publicationDateValidation = body('publicationDate').optional().isString().isISO8601().withMessage('Invalid availableResolutions')




videosRouter.get('/', async (req: Request, res: Response<Array<videoTypeDB>>) => {
    res.status(httpStatus.OK_200)
    res.json(await videosQueryRepositories.getAllVideos())
})

videosRouter.get('/:id', async (req: RequestWithParams<videoURImodel>, res: Response<videoTypeDB>) => {

    const foundVideos = await videosQueryRepositories.getVideoById(req.params.id)

    if (!foundVideos) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    res.status(httpStatus.OK_200)
    res.json(foundVideos)
})

// Create videos
videosRouter.post('/',
    titleValidation,
    authorValidation,
    availableResolutionsValidationRequired,
    inputValidationMiddleware,
    async (req: RequestWithBody<createVideoInputModel>, res: Response<ErrorType | videoTypeDB>) => {

        res.status(httpStatus.CREATED_201)
        res.json(await videosRepositories.createNewVideo(req.body))
    })

// Update Videos
videosRouter.put('/:id',
    titleValidation,
    authorValidation,
    ageRestrictionValidation,
    canBeDownloadedValidation,
    availableResolutionsValidation,
    publicationDateValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<videoURImodel, UpdateVideoInputModel>, res: Response<ErrorType>) => {

        if (!await videosRepositories.updateVideo(req.params.id, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }
    })

// Delete Videos
videosRouter.delete('/:id',
    async (req: RequestWithParams<videoURImodel>, res: Response) => {

    if (!req.params.id) {
        res.sendStatus(httpStatus.BAD_REQUEST_400)
        return;
    }

    const deleteVideo = await videosRepositories.deleteVideo(req.params.id)

    if (!deleteVideo) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    } else {
        res.sendStatus(httpStatus.NO_CONTENT_204)
    }

})
