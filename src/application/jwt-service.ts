import {userTypeDB} from '../database/dbInterface';
import jwt from 'jsonwebtoken'

export const jwtService = {


    async createJwt(user: userTypeDB) {
        const token = jwt.sign({userId: user.id}, 'secret', {expiresIn: '1h'})

        return token
    },

    async getUserIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, 'secret')
            return result.userId
        } catch (e) {
            return null
        }
    }
}