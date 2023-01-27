import {PostsService} from '../domain/posts-service';
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from '../types/requestTypes';
import {postsQueryModel} from '../models/posts-models/postsQueryModel';
import {Response} from 'express';
import {
    postsOutputModel,
    postsQueryRepositories,
    postToOutputModel
} from '../repositories/posts/posts-query-repositories';
import {ErrorType, httpStatus} from '../types/responseTypes';
import {postsURImodel} from '../models/posts-models/postsURImodel';
import {postTypeDB} from '../database/dbInterface';
import {CreatePostInputModel} from '../models/posts-models/CreatePostInputModel';
import {UpdatePostInputModel} from '../models/posts-models/UpdatePostInputModel';
import {commentsQueryModel} from '../models/comments-models/commentsQueryModel';
import {
    commentOutputModel,
    commentsOutputModel,
    commentsQueryRepositories
} from '../repositories/comments/comments-query-repositories';
import {CreateCommentInputModel} from '../models/comments-models/CreateCommentInputModel';
import {CommentsService} from '../domain/comments-service';
import {injectable} from 'inversify';
import {commentsURImodel} from '../models/comments-models/commentsURImodel';
import {CreateLikeInputModel} from '../models/likes-model/createLikeInputModel';
import {LikesModel} from '../models/likes-model/likesModel';


@injectable()
export class PostsController {

    constructor(
        protected postsService: PostsService,
        protected commentsService: CommentsService
    ) {
    }

    async getAllPosts(req: RequestWithQuery<postsQueryModel>, res: Response<postsOutputModel>) {
        res.status(httpStatus.OK_200)
        // @ts-ignore
        // console.log(req.userId)
        // @ts-ignore
        res.json(await postsQueryRepositories.getAllPosts(req.query, req.userId))
    }

    async getPostById(req: RequestWithParams<postsURImodel>, res: Response<postToOutputModel>) {

        // @ts-ignore
        const foundPost = await postsQueryRepositories.getPostById(req.params.postId, req.userId)

        if (!foundPost) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        res.status(httpStatus.OK_200)
        res.json(foundPost)
    }

    async createPost(req: RequestWithBody<CreatePostInputModel>, res: Response<ErrorType | postToOutputModel>) {
        try {
            const id = await this.postsService.createNewPost(req.body)
            // @ts-ignore
            const result = await postsQueryRepositories.getPostById(id, req.userId)
            res.status(httpStatus.CREATED_201)
            res.json(result)
        } catch (e) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    }

    async updatePost(req: RequestWithParamsAndBody<postsURImodel, UpdatePostInputModel>, res: Response<ErrorType>) {

        if (!req.params.postId) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        if (!await this.postsService.updatePost(req.params.postId, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }
    }

    async deletePost(req: RequestWithParams<postsURImodel>, res: Response) {

        if (!req.params.postId) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteVideo = await this.postsService.deletePost(req.params.postId)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
        }

    }

    async getPostComments(req: RequestWithParamsAndQuery<postsURImodel, commentsQueryModel>, res: Response<commentsOutputModel>) {

        // @ts-ignore
        const post = await postsQueryRepositories.getPostById(req.params.postId, req.userId)

        if (!post) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        // @ts-ignore
        const foundPost = await commentsQueryRepositories.getAllPostComments(req.params.postId, req.query, req.userId)

        res.status(httpStatus.OK_200)
        res.json(foundPost)
    }

    async createPostComment(req: RequestWithParamsAndBody<postsURImodel, CreateCommentInputModel>, res: Response<commentOutputModel>) {

        // @ts-ignore
        const post = await postsQueryRepositories.getPostById(req.params.postId, req.userId)

        if (!post) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }
        // @ts-ignore
        const id = await this.commentsService.createNewComment(req.user, req.params.postId, req.body)
        // @ts-ignore
        const result = await commentsQueryRepositories.getCommentById(id, req.user.userId)

        if (result !== null) {
            res.status(httpStatus.CREATED_201)
            res.json(result)
        }

    }

    async setLikes(req: RequestWithParamsAndBody<postsURImodel, CreateLikeInputModel>, res: Response<ErrorType>) {

        // @ts-ignore
        const post = await postsQueryRepositories.getPostById(req.params.postId, req.user.userId)


        if (!post) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        //@ts-ignore
        const likeInfo = await postsQueryRepositories.getUserLikeInfo(req.user.userId, req.params.postId)

        if (likeInfo !== LikesModel.Like && req.body.likeStatus === LikesModel.Like) {
            //@ts-ignore
            await this.postsService.setLikeStatus(req.params.postId, req.user.userId, req.body.likeStatus)
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        }

        if (likeInfo !== LikesModel.Dislike && req.body.likeStatus === LikesModel.Dislike) {
            //@ts-ignore
            await this.postsService.setLikeStatus(req.params.postId, req.user.userId, req.body.likeStatus)
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        }

        if (req.body.likeStatus === LikesModel.None) {
            //@ts-ignore
            await this.postsService.setLikeStatus(req.params.postId, req.user.userId, req.body.likeStatus)
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return
        }

        res.sendStatus(httpStatus.NO_CONTENT_204)
    }
}