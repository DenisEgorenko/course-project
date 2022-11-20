import {Request, Response} from 'express';
import {httpStatus} from './types/responseTypes';
import {videosRouter} from './routes/videos-router';
import {db} from './repositories/dataBase';
import {blogsRouter} from './routes/blogs-router';

const express = require('express')
export const app = express()
const port = 3000
app.use(express.json())


// Videos CRUD
app.use('/videos', videosRouter)
app.use('/blogs', blogsRouter)


// Testing method

app.delete('/testing/all-data', (req: Request, res: Response) => {
    db.videos = []
    db.posts = []
    db.blogs = []
    res.sendStatus(httpStatus.NO_CONTENT_204)
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`Listening on port ${port}`))
}