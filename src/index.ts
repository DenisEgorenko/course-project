import {Request, Response} from 'express';
import {httpStatus} from './types/responseTypes';
import {videosRouter} from './routes/videos-router';
import {blogsRouter} from './routes/blogs-router';
import {postsRouter} from './routes/posts-router';
import {runDb} from './database/db';
import {blogsDatabase, postsDatabase, usersDatabase, videosDatabase} from './database/dbInterface';
import {usersRouter} from './routes/users-router';
import {authRouter} from './routes/auth-router';
import {CommentsRouter} from './routes/comments-router';


const express = require('express')
export const app = express()
const port = 3000
app.use(express.json())


// Videos CRUD
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', CommentsRouter)


// Testing method

app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await videosDatabase.deleteMany({})
    await postsDatabase.deleteMany({})
    await blogsDatabase.deleteMany({})
    await usersDatabase.deleteMany({})

    res.sendStatus(httpStatus.NO_CONTENT_204)
})


const startApp = async () => {
    await runDb()

    if (process.env.NODE_ENV !== 'test') {
        app.listen(port, () => console.log(`Listening on port ${port}`))
    }
}


startApp()


