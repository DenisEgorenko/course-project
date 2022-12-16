import {CreateUserInputModel} from '../models/users-models/CreateUserInputModel';
import {passwordService} from '../application/password-service';
import {userTypeDB} from '../database/dbInterface';
import {usersRepositories} from '../repositories/users/users-repositories';
import {v4 as uuidv4} from 'uuid';
import add from 'date-fns/add'
import {EmailManager} from '../managers/email-manager';
import {usersQueryRepositories} from '../repositories/users/users-query-repositories';

export const authService = {
    async createUser(userData: CreateUserInputModel) {

        // const userExist = await usersQueryRepositories.getUserByEmailOrLogin(userData.login, userData.email)
        //
        // if (userExist) return false


        const passwordSalt = await passwordService.generateSalt()
        const passwordHash = await passwordService.generateHash(userData.password, passwordSalt)

        const newUser: userTypeDB = {
            accountData: {
                id: uuidv4(),
                login: userData.login,
                email: userData.email,
                password: passwordHash,
                salt: passwordSalt,
                createdAt: new Date()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1
                }),
                isConfirmed: false
            }
        }

        const userCreateRes = await usersRepositories.createNewUser(newUser)

        try {
            await EmailManager.sendRegistrationEmail(newUser)
        } catch (e) {
            return e
        }

        return userCreateRes
    },

    async confirmEmail(code: string) {
        let user = await usersQueryRepositories.getUserByConfirmationCode(code)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate < new Date()) return false
        let result = await usersRepositories.updateConfirmation(user.accountData.id)
        return result
    },

    async resendConfirmEmail(email: string) {
        let user = await usersQueryRepositories.getUserByEmailOrLogin(email)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false

        const newCode = uuidv4()
        const newExpDate = add(new Date(), {
            hours: 1
        })

        let updated = await usersRepositories.changeConfirmationData(user.accountData.id, newCode, newExpDate)

        if (updated) {

            await EmailManager.sendRegistrationEmail(await usersQueryRepositories.getUserByEmailOrLogin(email))

            return true
        }

        return false
    }
}