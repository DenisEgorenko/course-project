import {BlogsService} from "../domain/blogs-service";
import {PostsService} from "../domain/posts-service";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../types/requestTypes";
import {blogsQueryModel} from "../models/blogs-models/blogsQueryModel";
import {Response} from "express";
import {blogsOutputModel, blogsQueryRepositories} from "../repositories/blogs/blogs-query-repositories";
import {ErrorType, httpStatus} from "../types/responseTypes";
import {blogsURImodel} from "../models/blogs-models/blogsURImodel";
import {blogTypeDB, postTypeDB} from "../database/dbInterface";
import {postsQueryModel} from "../models/posts-models/postsQueryModel";
import {postsOutputModel, postsQueryRepositories} from "../repositories/posts/posts-query-repositories";
import {CreateBlogInputModel} from "../models/blogs-models/CreateBlogInputModel";
import {CreatePostInputModel} from "../models/posts-models/CreatePostInputModel";
import {UpdateBlogInputModel} from "../models/blogs-models/UpdateBlogInputModel";

export class BlogsController {

    constructor(
        protected blogsService: BlogsService,
        protected postsService: PostsService
    ) {

    }

    async getAllBlogs(req: RequestWithQuery<blogsQueryModel>, res: Response<blogsOutputModel>) {
        res.status(httpStatus.OK_200)
        res.json(await blogsQueryRepositories.getAllBlogs(req.query))
    }

    async getBlogById(req: RequestWithParams<blogsURImodel>, res: Response<blogTypeDB>) {

        const foundBlog = await blogsQueryRepositories.getBlogById(req.params.id)

        if (!foundBlog) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        res.status(httpStatus.OK_200)
        res.json(foundBlog)
    }

    async getBlogPosts(req: RequestWithParamsAndQuery<blogsURImodel, postsQueryModel>, res: Response<postsOutputModel>) {

        const blog = await blogsQueryRepositories.getBlogById(req.params.id)

        if (!blog) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        res.status(httpStatus.OK_200)
        res.json(await blogsQueryRepositories.getAllBlogsPosts(req.params.id, req.query))
    }

    async createBlog(req: RequestWithBody<CreateBlogInputModel>, res: Response<ErrorType | blogTypeDB>) {
        try {
            const id = await this.blogsService.createNewBlog(req.body)
            const result = await blogsQueryRepositories.getBlogById(id)
            res.status(httpStatus.CREATED_201)
            res.json(result)
        } catch (e) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    }

    async createBlogPost(req: RequestWithParamsAndBody<blogsURImodel, CreatePostInputModel>, res: Response<ErrorType | postTypeDB>) {

        const blog = await blogsQueryRepositories.getBlogById(req.params.id)

        if (!blog) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        }

        req.body.blogId = req.params.id

        try {
            const id = await this.postsService.createNewPost(req.body)
            const result = await postsQueryRepositories.getPostById(id)
            res.status(httpStatus.CREATED_201)
            res.json(result)
        } catch (e) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    }

    async updateBlog(req: RequestWithParamsAndBody<blogsURImodel, UpdateBlogInputModel>, res: Response<ErrorType>) {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        if (!await this.blogsService.updateBlog(req.params.id, req.body)) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return;
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return;
        }
    }

    async deleteBlog(req: RequestWithParams<blogsURImodel>, res: Response) {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteVideo = await this.blogsService.deleteBlog(req.params.id)

        if (!deleteVideo) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return;
        }

    }
}