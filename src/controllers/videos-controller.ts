import {VideosRepositories} from "../repositories/videos/videos-repositories";
import {Request, Response} from "express";
import {videoTypeDB} from "../database/dbInterface";
import {ErrorType, httpStatus} from "../types/responseTypes";
import {videosQueryRepositories} from "../repositories/videos/videos-query-repositories";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestTypes";
import {videoURImodel} from "../models/videos-models/videoURImodel";
import {createVideoInputModel} from "../models/videos-models/CreateVideoInputModel";
import {UpdateVideoInputModel} from "../models/videos-models/UpdateVideoInputModel";
import {injectable} from "inversify";


@injectable()
export class VideosController {

    constructor(protected videosRepositories: VideosRepositories) {
    }

    async getAllVideos(req: Request, res: Response<Array<videoTypeDB>>) {
        res.status(httpStatus.OK_200)
        res.json(await videosQueryRepositories.getAllVideos())
    }

    async getVideoById(req: RequestWithParams<videoURImodel>, res: Response<videoTypeDB>) {

        const foundVideos = await videosQueryRepositories.getVideoById(req.params.id)

        if (!foundVideos) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        res.status(httpStatus.OK_200)
        res.json(foundVideos)
    }

    async createVideo(req: RequestWithBody<createVideoInputModel>, res: Response<ErrorType | videoTypeDB>) {
        res.status(httpStatus.CREATED_201)
        res.json(await this.videosRepositories.createNewVideo(req.body))
    }

    async updateVideo(req: RequestWithParamsAndBody<videoURImodel, UpdateVideoInputModel>, res: Response<ErrorType>) {

        if (!await this.videosRepositories.updateVideo(req.params.id, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }
    }

    async deleteVideo(req: RequestWithParams<videoURImodel>, res: Response) {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteVideo = await this.videosRepositories.deleteVideo(req.params.id)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }

    }
}