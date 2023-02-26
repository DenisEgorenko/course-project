import {UsersRepositories} from '../infrastructure/users-repositories';
import {CreateUserDTO} from '../domain/dto/CreateUserDTO';
import {authInputModel} from '../../auth/domain/dto/authInputModel';
import {passwordService} from '../../../application/password-service';
import {injectable} from 'inversify';
import {HydratedDocument} from 'mongoose';
import {userTypeDB} from '../../../database/dbInterface';
import {User} from '../domain/UserEntity';


export type UserFilterQuery = {
    id: string
}

@injectable()
export class UsersService {

    constructor(protected usersRepositories: UsersRepositories) {
    }

    async createNewUser(requestData: CreateUserDTO): Promise<string> {

        const passwordSalt = await passwordService.generateSalt()
        const passwordHash = await passwordService.generateHash(requestData.password, passwordSalt)

        const newUser: HydratedDocument<userTypeDB> = new User(
            {
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
        )

        await this.usersRepositories.save(newUser)

        return newUser.accountData.id

        // try {
        //     await this.usersRepositories.createNewUser(newUser)
        //     return newUser.accountData.id
        // } catch (e) {
        //     return ''
        // }
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

