import {userTypeDB} from '../database/dbInterface';
import {usersRepositories} from '../repositories/users/users-repositories';
import {CreateUserInputModel} from '../models/users-models/CreateUserInputModel';
import {authInputModel} from '../models/auth-models/authInputModel';
import {passwordService} from '../application/password-service';

export type updateBlogQuery = {
    $set: {
        name: string,
        description: string,
        websiteUrl: string,
    }
}

export type UserFilterQuery = {
    id: string
}

export const usersService = {


    async createNewUser(requestData: CreateUserInputModel): Promise<string> {

        const passwordSalt = await passwordService.generateSalt()
        const passwordHash = await passwordService.generateHash(requestData.password, passwordSalt)

        const newUser: userTypeDB = {
            accountData: {
                id: (+(new Date())).toString(),
                login: requestData.login,
                email: requestData.email,
                password: passwordHash,
                salt: passwordSalt,
                refreshToken: null,
                createdAt: new Date()
            },
            emailConfirmation: {
                confirmationCode: null,
                expirationDate: null,
                isConfirmed: true
            },
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null,
            }
        }

        try {
            await usersRepositories.createNewUser(newUser)
            return newUser.accountData.id
        } catch (e) {
            return ''
        }
    },

    async checkCredentials(userData: userTypeDB, requestData: authInputModel): Promise<boolean> {
        const passwordHash = await passwordService.generateHash(requestData.password, userData.accountData.salt)
        return passwordHash === userData.accountData.password;
    },

    async deleteUser(id: string) {
        const filterQuery: UserFilterQuery = {
            id: id
        }
        return await usersRepositories.deleteUser(filterQuery)
    },


}