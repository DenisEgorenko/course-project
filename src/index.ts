import {Request, Response} from "express";
import {ErrorType, httpStatus} from "./types/responseTypes";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "./types/requestTypes";
import {createVideoInputModel} from "./models/CreateVideoInputModel";
import {videoURImodel} from "./models/videoURImodel";
import {UpdateVideoInputModel} from "./models/UpdateVideoInputModel";

const express = require('express')
export const app = express()
const port = 3000
app.use(express.json())


export enum resolutions {
    "P144" = "P144",
    "P240" = "P240",
    "P360" = "P360",
    "P480" = "P480",
    "P720" = "P720",
    "P1080" = "P1080",
    "P1440" = "P1440",
    "P2160" = "P2160",
}

export type videoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string
    publicationDate: string
    availableResolutions: Array<resolutions>
}
export type dbType = { videos: Array<videoType> }

export const db: dbType = {
    videos: [
        {
            id: +(new Date()),
            title: 'Видео',
            author: 'John',
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: new Date().toISOString(),
            publicationDate: new Date().toISOString(),
            availableResolutions: [resolutions.P240, resolutions.P360]
        },
        {
            id: +(new Date()),
            title: 'Видео',
            author: 'John',
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: new Date().toISOString(),
            publicationDate: new Date().toISOString(),
            availableResolutions: [resolutions.P240, resolutions.P360]
        }
    ]
}


// Videos CRUD

// Read videos

app.get('/videos', (req: Request, res: Response<Array<videoType>>) => {
    res.status(httpStatus.OK_200)
    res.json(db.videos)
})

app.get('/videos/:id', (req: RequestWithParams<videoURImodel>, res: Response<videoType>) => {

    const foundVideos = db.videos.filter(video => video.id === +req.params.id)

    if (!foundVideos.length) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    res.status(httpStatus.OK_200)
    res.json(foundVideos[0])
})

// Create videos

app.post('/videos', (req: RequestWithBody<createVideoInputModel>, res: Response<Array<ErrorType> | videoType>) => {


    if (!req.body.title || !req.body.author || req.body.title.length > 40 || req.body.author.length > 20) {

        let errorArray: Array<ErrorType> = []

        if (!req.body.title) {
            errorArray.push(
                {
                    message: 'Request should consist title',
                    field: 'title'
                }
            )
        } else if (req.body.title.length > 40) {
            errorArray.push(
                {
                    message: 'Length of title should be less than 40 ',
                    field: 'title'
                }
            )
        }

        if (!req.body.author) {
            errorArray.push(
                {
                    message: 'Request should consist author name',
                    field: 'author'
                }
            )
        } else if (req.body.author.length > 20) {
            errorArray.push(
                {
                    message: 'Length of author name should be less than 20 ',
                    field: 'author'
                }
            )
        }

        res.status(httpStatus.BAD_REQUEST_400)
        res.json(errorArray)
        return
    }

    const publicationDate = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()

    const newVideo: videoType = {
        id: +(new Date()),
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: new Date().toISOString(),
        publicationDate: publicationDate,
        availableResolutions: req.body.availableResolutions
    }
    db.videos.push(newVideo)
    res.status(httpStatus.OK_200)
    res.json(newVideo)
})


// Update Videos

app.put('/videos/:id', (req: RequestWithParamsAndBody<videoURImodel, UpdateVideoInputModel>, res: Response<ErrorType[]>) => {

    if ((!req.body.title || req.body.title.length > 40)
        || (!req.body.author || req.body.author.length > 20)
        || (req.body.minAgeRestriction && (req.body.minAgeRestriction > 18 || req.body.minAgeRestriction < 1))) {

        const error: ErrorType[] = []

        if (req.body.minAgeRestriction && (req.body.minAgeRestriction > 18 || req.body.minAgeRestriction < 1)) {
            error.push({
                field: 'minAgeRestriction',
                message: 'age should be more than 1 and less than 19'
            })
        }

        if (!req.body.title || req.body.title.length > 40) {
            error.push({
                field: 'title',
                message: 'title is required or longer than 40'
            })
        }

        if (!req.body.author || req.body.author.length > 20) {
            error.push({
                field: 'author',
                message: 'author is required or longer than 20'
            })
        }

        res.status(httpStatus.BAD_REQUEST_400)
        res.json(error)
        return
    }

    const video = db.videos.find(video => video.id === +req.params.id)

    if (!video) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return;
    }

    video.title = req.body.title
    video.author = req.body.author

    if (req.body.canBeDownloaded) {
        video.canBeDownloaded = req.body.canBeDownloaded
    }

    if (req.body.minAgeRestriction) {
        video.minAgeRestriction = req.body.minAgeRestriction
    }

    if (req.body.publicationDate) {
        video.publicationDate = req.body.publicationDate
    }

    if (req.body.availableResolutions) {
        video.availableResolutions = req.body.availableResolutions
    }

    db.videos = db.videos.map(video => video.id === req.params.id ? {...video, ...req.body} : video)
    res.sendStatus(httpStatus.NO_CONTENT_204)
})

// Delete Videos

app.delete('/videos/:id', (req: RequestWithParams<videoURImodel>, res: Response) => {

    if (!req.params.id) {
        res.sendStatus(httpStatus.BAD_REQUEST_400)
        return;
    }

    const foundVideo = db.videos.filter(video => video.id === +req.params.id)

    if (!foundVideo.length) {
        res.sendStatus(httpStatus.NOT_FOUND_404)
        return
    }

    const videoWithoutDeleted = db.videos.filter(video => video.id !== +req.params.id)
    db.videos = videoWithoutDeleted
    res.sendStatus(httpStatus.NO_CONTENT_204)
})


// Testing method

app.delete('/testing/all-data', (req: Request, res: Response) => {
    db.videos = []
    res.sendStatus(httpStatus.NO_CONTENT_204)
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`Listening on port ${port}`))
}