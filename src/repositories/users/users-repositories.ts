import {usersDatabase, userTypeDB} from '../../database/dbInterface';
import {UserFilterQuery} from '../../domain/users-service';


export const usersRepositories = {

    async createNewUser(newUser: userTypeDB) {
        try {
            await usersDatabase.insertOne({...newUser})
            return true
        } catch (e) {
            return false
        }
    },

    async deleteUser(filterQuery: UserFilterQuery): Promise<boolean> {
        const result = await usersDatabase.deleteOne(filterQuery)
        return result.deletedCount >= 1
    },

    async updateConfirmation(userId: string) {
        const result = await usersDatabase.updateOne(
            {'accountData.id': userId},
            {$set: {'emailConfirmation.isConfirmed': true}}
        )
        return result.modifiedCount >= 1;
    },


    async changeConfirmationData(userId: string, newCode: string, newExpDate: Date) {
        const result = await usersDatabase.updateOne(
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
}
