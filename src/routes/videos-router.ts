import {Router} from 'express';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {resolutions} from '../models/videos-models/resolutionsModel';
import {container} from "../composition-root";
import {VideosController} from "../controllers/videos-controller";

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


// Controller

const videosController = container.resolve(VideosController)

// Routes
videosRouter.get('/', videosController.getAllVideos.bind(videosController))

videosRouter.get('/:id', videosController.getVideoById.bind(videosController))

videosRouter.post('/',
    titleValidation,
    authorValidation,
    availableResolutionsValidationRequired,
    inputValidationMiddleware,
    videosController.createVideo.bind(videosController)
)

videosRouter.put('/:id',
    titleValidation,
    authorValidation,
    ageRestrictionValidation,
    canBeDownloadedValidation,
    availableResolutionsValidation,
    publicationDateValidation,
    inputValidationMiddleware,
    videosController.updateVideo.bind(videosController)
)

// Delete Videos
videosRouter.delete('/:id', videosController.deleteVideo.bind(videosController))
