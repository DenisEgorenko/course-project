declare namespace Express {
    export interface Request {
        user: {
            userId: string,
            login: string,
            email: string,
        },

        cookie
    }
}