import "reflect-metadata"
import {UsersRepositories} from "./features/users/infrastructure/users-repositories";
import {UsersService} from "./features/users/application/users-service";
import {BlogsRepositories} from "./repositories/blogs/blogs-repositories";
import {CommentsRepositories} from "./repositories/comments/comments-repositories";
import {PostsRepositories} from "./repositories/posts/posts-repositories";
import {VideosRepositories} from "./repositories/videos/videos-repositories";
import {SecurityDevicesRepositories} from "./repositories/securityDevices/security-devices-repositories";
import {AuthService} from "./features/auth/application/auth-service";
import {BlogsService} from "./domain/blogs-service";
import {PostsService} from "./domain/posts-service";
import {CommentsService} from "./domain/comments-service";
import {UsersController} from "./features/users/api/users-controller";
import {AuthController} from "./features/auth/api/auth-controller";
import {BlogsController} from "./controllers/blogs-controller";
import {CommentsController} from "./controllers/comments-controller";
import {PostsController} from "./controllers/posts-controller";
import {SecurityDevicesController} from "./controllers/security-devices-controller";
import {VideosController} from "./controllers/videos-controller";
import {Container} from "inversify";


export const container = new Container()

container.bind(UsersRepositories).to(UsersRepositories)
container.bind(SecurityDevicesRepositories).to(SecurityDevicesRepositories)
container.bind(BlogsRepositories).to(BlogsRepositories)
container.bind(CommentsRepositories).to(CommentsRepositories)
container.bind(PostsRepositories).to(PostsRepositories)
container.bind(VideosRepositories).to(VideosRepositories)

container.bind(UsersService).to(UsersService)
container.bind(AuthService).to(AuthService)
container.bind(BlogsService).to(BlogsService)
container.bind(PostsService).to(PostsService)
container.bind(CommentsService).to(CommentsService)

container.bind(UsersController).to(UsersController)
container.bind(AuthController).to(AuthController)
container.bind(BlogsController).to(BlogsController)
container.bind(PostsController).to(PostsController)
container.bind(SecurityDevicesController).to(SecurityDevicesController)
container.bind(CommentsController).to(CommentsController)
container.bind(VideosController).to(VideosController)
