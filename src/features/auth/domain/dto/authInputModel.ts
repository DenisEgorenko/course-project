export type authInputModel = {
    loginOrEmail: string,
    password: string,
}


export type bearerAuthModel = {
    user: {
        email: string,
        login: string,
        userId: string
    }
}