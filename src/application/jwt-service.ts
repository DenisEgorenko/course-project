import jwt from 'jsonwebtoken'

export const jwtService = {


    async createJwt(userId: string) {
        const token = jwt.sign({userId}, 'secret', {expiresIn: '5m'})

        return token
    },

    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, 'secret')
            return result.userId
        } catch (e) {
            return null
        }
    },


    async createRefreshToken(userId: string, deviceId: string, refreshToken: string) {
        const token = jwt.sign({
            userId: userId,
            deviceId: deviceId,
            refreshToken: refreshToken
        }, 'secret', {expiresIn: '20s'})
        return token
    },


    async getAccessDataFromJWT(jwtToken: string) {
        try {
            const result: any = jwt.verify(jwtToken, 'secret')
            return result
        } catch (e) {
            return false
        }
    },

}