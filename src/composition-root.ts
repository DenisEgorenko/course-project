import {UsersRepositories} from "./repositories/users/users-repositories";
import {UsersService} from "./domain/users-service";
import {BlogsRepositories} from "./repositories/blogs/blogs-repositories";
import {CommentsRepositories} from "./repositories/comments/comments-repositories";
import {PostsRepositories} from "./repositories/posts/posts-repositories";
import {VideosRepositories} from "./repositories/videos/videos-repositories";
import {SecurityDevicesRepositories} from "./repositories/securityDevices/security-devices-repositories";
import {AuthService} from "./domain/auth-service";
import {BlogsService} from "./domain/blogs-service";
import {PostsService} from "./domain/posts-service";
import {CommentsService} from "./domain/comments-service";
import {UsersController} from "./controllers/users-controller";
import {AuthController} from "./controllers/auth-controller";
import {BlogsController} from "./controllers/blogs-controller";
import {CommentsController} from "./controllers/comments-controller";
import {PostsController} from "./controllers/posts-controller";
import {SecurityDevicesController} from "./controllers/security-devices-controller";
import {VideosController} from "./controllers/videos-controller";


const usersRepositories = new UsersRepositories()
const blogsRepositories = new BlogsRepositories()
const commentsRepositories = new CommentsRepositories()
const postsRepositories = new PostsRepositories()
const securityDevicesRepositories = new SecurityDevicesRepositories()
const videosRepositories = new VideosRepositories()


const usersService = new UsersService(usersRepositories)
const authService = new AuthService(usersRepositories, securityDevicesRepositories)
const blogsService = new BlogsService(blogsRepositories)
const postsService = new PostsService(postsRepositories)
const commentsService = new CommentsService(commentsRepositories)


export const usersController = new UsersController(usersService)
export const authController = new AuthController(authService, usersService)
export const blogsController = new BlogsController(blogsService, postsService)
export const postsController = new PostsController(postsService, commentsService)
export const securityDevicesController = new SecurityDevicesController(authService)
export const commentsController = new CommentsController(commentsService)
export const videosController = new VideosController(videosRepositories)