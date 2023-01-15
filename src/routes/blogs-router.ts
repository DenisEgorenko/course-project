import {Router} from 'express';
import {body} from 'express-validator';
import {inputValidationMiddleware} from '../middlewares/input-validation-middleware';
import {authorisationMiddleware} from '../middlewares/authorisation-middleware';
import {contentValidation, shortDescriptionValidation, titleValidation} from './posts-router';
import {container} from "../composition-root";
import {BlogsController} from "../controllers/blogs-controller";

export const blogsRouter = Router({})


const blogNameValidation = body('name')
    .trim()
    .isLength({
        min: 1,
        max: 15
    })
    .withMessage('Request should consist title with length less than 15')


const blogDescriptionValidation = body('description')
    .trim()
    .isLength({
        min: 1,
        max: 500
    })
    .withMessage('Request should consist description with length less than 500')

const UrlValidation = body('websiteUrl')
    .isLength({
        min: 1,
        max: 100
    })
    .matches(`^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$`)
    .withMessage('Request should consist websiteUrl')


// Controller

const blogsController = container.resolve(BlogsController)


// Routes
// Read
blogsRouter.get('/', blogsController.getAllBlogs.bind(blogsController))

blogsRouter.get('/:id', blogsController.getBlogById.bind(blogsController))

blogsRouter.get('/:id/posts', blogsController.getBlogPosts.bind(blogsController))

// Create blog
blogsRouter.post('/',
    authorisationMiddleware,
    blogNameValidation,
    blogDescriptionValidation,
    UrlValidation,
    inputValidationMiddleware,
    blogsController.createBlog.bind(blogsController)
)

blogsRouter.post('/:id/posts',
    authorisationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    inputValidationMiddleware,
    blogsController.createBlogPost.bind(blogsController)
)

// Update Blog
blogsRouter.put('/:id',
    authorisationMiddleware,
    blogNameValidation,
    blogDescriptionValidation,
    UrlValidation,
    inputValidationMiddleware,
    blogsController.updateBlog.bind(blogsController)
)

// Delete Blog
blogsRouter.delete('/:id',
    authorisationMiddleware,
    inputValidationMiddleware,
    blogsController.deleteBlog.bind(blogsController)
)
