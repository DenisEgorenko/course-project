import {CreateUserInputModel} from '../models/users-models/CreateUserInputModel';
import {passwordService} from '../application/password-service';
import {securityDevicesTypeDB, userTypeDB} from '../database/dbInterface';
import {usersRepositories} from '../repositories/users/users-repositories';
import {v4 as uuidv4} from 'uuid';
import add from 'date-fns/add'
import {EmailManager} from '../managers/email-manager';
import {usersQueryRepositories} from '../repositories/users/users-query-repositories';
import {jwtService} from '../application/jwt-service';
import {accessDataType} from '../models/auth-models/assessDataType';
import {usersService} from './users-service';
import {securityDevicesRepositories} from "../repositories/securityDevices/security-devices-repositories";

export const authService = {
    async createUser(userData: CreateUserInputModel) {

        const passwordSalt = await passwordService.generateSalt()
        const passwordHash = await passwordService.generateHash(userData.password, passwordSalt)

        const newUser: userTypeDB = {
            accountData: {
                id: uuidv4(),
                login: userData.login,
                email: userData.email,
                password: passwordHash,
                salt: passwordSalt,
                refreshToken: null,
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
    },


    async createSecuritySession(userId: string, ip: string, title: string) {
        const refreshToken = uuidv4()
        const deviceId = uuidv4()
        const jwtToken = await jwtService.createRefreshToken(userId, deviceId, refreshToken)

        const newSession: securityDevicesTypeDB = {
            ip,
            title,
            lastActiveDate: new Date(),
            deviceId,
            userId
        }

        const saveSecurityDevices = await securityDevicesRepositories.createNewSession(newSession)

        await usersRepositories.updateRefreshToken(userId, refreshToken)

        return jwtToken
    },

    async updateSecuritySession(userId: string, ip: string, title: string, deviceId: string) {
        const refreshToken = uuidv4()

        const jwtToken = await jwtService.createRefreshToken(userId, deviceId, refreshToken)

        await securityDevicesRepositories.updateSession(deviceId)

        await usersRepositories.updateRefreshToken(userId, refreshToken)

        return jwtToken
    },

    async removeAllSecuritySessions(userId: string, deviceId: string) {

        await securityDevicesRepositories.removeAllSecuritySessions(userId, deviceId)

        return true
    },

    async removeSecuritySession(deviceId: string) {

        await securityDevicesRepositories.removeSecuritySession(deviceId)

        return true
    },

    async logOutWithRefreshToken(accessData: accessDataType) {
        await securityDevicesRepositories.removeSecuritySession(accessData.deviceId)

        return await usersRepositories.updateRefreshToken(accessData.userId, null)
    }
}