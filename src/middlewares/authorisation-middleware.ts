import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';

const auth = {login: 'admin', password: 'qwerty'}

export const authorisationMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authType = (req.headers.authorization || '').split(' ')[0] || ''

    if (authType !== 'Basic') {
        res.status(401).send('Authentication wrong.')
    }

    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''

    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')


    if (login && password && login === auth.login && password === auth.password) {
        next()
    } else {
        res.status(401).send('Authentication required.')
    }
}