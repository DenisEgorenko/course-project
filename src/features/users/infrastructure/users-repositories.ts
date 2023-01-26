import {User, userTypeDB} from '../../../database/dbInterface';
import {UserFilterQuery} from '../application/users-service';
import {injectable} from 'inversify';
import {HydratedDocument} from 'mongoose';

@injectable()
export class UsersRepositories {

    async save(newUser: HydratedDocument<userTypeDB>) {
        await newUser.save()
    }

    // async createNewUser(newUser: userTypeDB) {
    //     try {
    //         const newUserEntity = new User(newUser)
    //         await newUserEntity.save()
    //         return true
    //     } catch (e) {
    //         return false
    //     }
    // }

    async deleteUser(filterQuery: UserFilterQuery): Promise<boolean> {
        const result = await User.deleteOne(filterQuery)
        return result.deletedCount >= 1
    }

    async updateConfirmation(userId: string) {
        const result = await User.updateOne(
            {'accountData.id': userId},
            {$set: {'emailConfirmation.isConfirmed': true}}
        )
        return result.modifiedCount >= 1;
    }

    async updateRefreshToken(userId: string, refreshToken: string | null) {
        const result = await User.updateOne(
            {'accountData.id': userId},
            {$set: {'accountData.refreshToken': refreshToken}}
        )
        return result.modifiedCount >= 1;
    }


    async changeConfirmationData(userId: string, newCode: string, newExpDate: Date) {
        const result = await User.updateOne(
            {'accountData.id': userId},
            {
                $set: {
                    'emailConfirmation.confirmationCode': newCode,
                    'emailConfirmation.expirationDate': newExpDate
                }
            }
        )
        return result.modifiedCount >= 1;
    }

    async updatePasswordRecoveryData(userId: string, recoveryCode: string, expirationData: Date) {
        const result = await User.updateOne(
            {'accountData.id': userId},
            {
                $set: {
                    'passwordRecovery.recoveryCode': recoveryCode,
                    'passwordRecovery.expirationDate': expirationData
                }
            }
        )
        return result.modifiedCount >= 1;
    }

    async setNewPassword(userId: string, passwordSalt: string, passwordHash: string) {
        const result = await User.updateOne(
            {'accountData.id': userId},
            {
                $set: {
                    'accountData.salt': passwordSalt,
                    'accountData.password': passwordHash,
                    'passwordRecovery.recoveryCode': null,
                    'passwordRecovery.expirationDate': null
                }
            }
        )
        return result.modifiedCount >= 1;
    }
}
