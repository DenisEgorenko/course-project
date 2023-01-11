import {userTypeDB} from '../database/dbInterface';
import {UsersRepositories} from '../repositories/users/users-repositories';
import {CreateUserInputModel} from '../models/users-models/CreateUserInputModel';
import {authInputModel} from '../models/auth-models/authInputModel';
import {passwordService} from '../application/password-service';


export type UserFilterQuery = {
    id: string
}

export class UsersService {

    constructor(protected usersRepositories: UsersRepositories) {
    }

    async createNewUser(requestData: CreateUserInputModel): Promise<string> {

        const passwordSalt = await passwordService.generateSalt()
        const passwordHash = await passwordService.generateHash(requestData.password, passwordSalt)

        const newUser: userTypeDB = new userTypeDB(
            {
                id: (+(new Date())).toString(),
                login: requestData.login,
                email: requestData.email,
                password: passwordHash,
                salt: passwordSalt,
                refreshToken: null,
                createdAt: new Date()
            },
            {
                confirmationCode: null,
                expirationDate: null,
                isConfirmed: true
            },
            {
                recoveryCode: null,
                expirationDate: null,
            }
        )

        try {
            await this.usersRepositories.createNewUser(newUser)
            return newUser.accountData.id
        } catch (e) {
            return ''
        }
    }

    async checkCredentials(userData: userTypeDB, requestData: authInputModel): Promise<boolean> {
        const passwordHash = await passwordService.generateHash(requestData.password, userData.accountData.salt)
        return passwordHash === userData.accountData.password;
    }

    async deleteUser(id: string) {
        const filterQuery: UserFilterQuery = {
            id: id
        }
        return await this.usersRepositories.deleteUser(filterQuery)
    }
}

