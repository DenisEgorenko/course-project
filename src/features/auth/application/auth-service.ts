import {CreateUserDTO} from '../../users/domain/dto/CreateUserDTO';
import {passwordService} from '../../../application/password-service';
import {securityDevicesTypeDB, User, userTypeDB} from '../../../database/dbInterface';
import {UsersRepositories} from '../../users/infrastructure/users-repositories';
import {v4 as uuidv4} from 'uuid';
import add from 'date-fns/add'
import {EmailManager} from '../../../managers/email-manager';
import {jwtService} from '../../../application/jwt-service';
import {accessDataType} from '../domain/models/assessDataType';
import {SecurityDevicesRepositories} from "../../../repositories/securityDevices/security-devices-repositories";
import {injectable} from "inversify";
import {HydratedDocument} from 'mongoose';


@injectable()
export class AuthService {

    constructor(
        protected usersRepository: UsersRepositories,
        protected securityDevicesRepositories: SecurityDevicesRepositories
    ) {

    }

    async createUser(userData: CreateUserDTO) {
        const passwordSalt = await passwordService.generateSalt()
        const passwordHash = await passwordService.generateHash(userData.password, passwordSalt)

        const newUser: HydratedDocument<userTypeDB> = new User(
            {
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
                },
                passwordRecovery: {
                    recoveryCode: null,
                    expirationDate: null,
                }
            }
        )

        const userCreateRes = await this.usersRepository.save(newUser)

        try {
            await EmailManager.sendRegistrationEmail(newUser)
        } catch (e) {
            return e
        }

        return userCreateRes
    }

    async confirmEmail(code: string, user: userTypeDB) {

        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate && user.emailConfirmation.expirationDate < new Date()) return false

        let result = await this.usersRepository.updateConfirmation(user.accountData.id)
        return result
    }

    async resendConfirmEmail(email: string, user: userTypeDB) {
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false

        const newCode = uuidv4()
        const newExpDate = add(new Date(), {
            hours: 1
        })

        let updated = await this.usersRepository.changeConfirmationData(user.accountData.id, newCode, newExpDate)

        if (updated) {

            await EmailManager.sendRegistrationEmail(user)

            return true
        }

        return false
    }

    async createSecuritySession(userId: string, ip: string, title: string) {
        const refreshToken = uuidv4()
        const deviceId = uuidv4()
        const jwtToken = await jwtService.createRefreshToken(userId, deviceId, refreshToken)

        const newSession: securityDevicesTypeDB = new securityDevicesTypeDB(
            ip,
            title,
            new Date(),
            deviceId,
            userId
        )

        await this.securityDevicesRepositories.createNewSession(newSession)

        await this.usersRepository.updateRefreshToken(userId, refreshToken)

        return jwtToken
    }

    async updateSecuritySession(userId: string, ip: string, title: string, deviceId: string) {
        const refreshToken = uuidv4()

        const jwtToken = await jwtService.createRefreshToken(userId, deviceId, refreshToken)

        await this.securityDevicesRepositories.updateSession(deviceId)

        await this.usersRepository.updateRefreshToken(userId, refreshToken)

        return jwtToken
    }

    async removeAllSecuritySessions(userId: string, deviceId: string) {

        await this.securityDevicesRepositories.removeAllSecuritySessions(userId, deviceId)

        return true
    }

    async removeSecuritySession(deviceId: string) {

        await this.securityDevicesRepositories.removeSecuritySession(deviceId)

        return true
    }

    async logOutWithRefreshToken(accessData: accessDataType) {
        await this.securityDevicesRepositories.removeSecuritySession(accessData.deviceId)

        return await this.usersRepository.updateRefreshToken(accessData.userId, null)
    }

    async passwordRecovery(user: userTypeDB) {

        const recoveryCode = uuidv4()
        const expirationDate = add(new Date(), {
            hours: 1
        })

        await EmailManager.sendPasswordRecoveryEmail(user.accountData.email, recoveryCode)

        await this.usersRepository.updatePasswordRecoveryData(user.accountData.id, recoveryCode, expirationDate)

        return true
    }

    async setNewPassword(userId: string, newPassword: string) {

        const passwordSalt = await passwordService.generateSalt()
        const passwordHash = await passwordService.generateHash(newPassword, passwordSalt)

        return await this.usersRepository.setNewPassword(userId, passwordSalt, passwordHash)
    }
}
