import {Request, Response} from 'express';
import {httpStatus} from './types/responseTypes';
import {videosRouter} from './routes/videos-router';
import {db} from './repositories/dataBase';
import {blogsRouter} from './routes/blogs-router';
import {postsRouter} from './routes/posts-router';
import {runDb} from './database/db';
import {videosDatabase} from './repositories/videos-repositories';

const express = require('express')
export const app = express()
const port = 3000
app.use(express.json())


// Videos CRUD
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)


// Testing method

app.delete('/testing/all-data', async (req: Request, res: Response) => {
    await videosDatabase.deleteMany({})
    db.posts = []
    db.blogs = []
    res.sendStatus(httpStatus.NO_CONTENT_204)
})


const startApp = async () => {
    await runDb()

    if (process.env.NODE_ENV !== 'test') {
        app.listen(port, () => console.log(`Listening on port ${port}`))
    }
}


startApp()


