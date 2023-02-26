import {Request, Response} from 'express';
import {httpStatus} from './types/responseTypes';
import {videosRouter} from './routes/videos-router';
import {blogsRouter} from './routes/blogs-router';
import {postsRouter} from './routes/posts-router';
import {runDb} from './database/db';
import {Blog, Comment, Post, Video} from './database/dbInterface';
import {usersRouter} from './routes/users-router';
import {authRouter} from './routes/auth-router';
import {CommentsRouter} from './routes/comments-router';
import cookies from 'cookie-parser'
import {SecurityDevicesRouter} from "./routes/security-devices-router";
import {User} from './features/users/domain/UserEntity';


const express = require('express')
export const app = express()
const port = 3000
app.use(express.json())
app.use(cookies())
app.set('trust proxy', true)

// Videos CRUD
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', CommentsRouter)
app.use('/security', SecurityDevicesRouter)


// Testing method

app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await Video.deleteMany({})
    await Post.deleteMany({})
    await Blog.deleteMany({})
    await User.deleteMany({})
    await Comment.deleteMany({})

    res.sendStatus(httpStatus.NO_CONTENT_204)
})


const startApp = async () => {
    await runDb()

    if (process.env.NODE_ENV !== 'test') {
        app.listen(port, () => console.log(`Listening on port ${port}`))
    }
}


startApp()


