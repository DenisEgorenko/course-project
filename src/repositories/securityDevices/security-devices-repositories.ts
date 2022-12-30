import {securityDevicesDatabase, securityDevicesTypeDB, usersDatabase, userTypeDB} from '../../database/dbInterface';
import {UserFilterQuery} from '../../domain/users-service';
import {securityDevicesQueryRepositories} from "./security-devices-query-repositories";


export const securityDevicesRepositories = {

    async createNewSession(newSession: securityDevicesTypeDB) {
        try {
            await securityDevicesDatabase.insertOne({...newSession})
            return true
        } catch (e) {
            return false
        }
    },

    async updateSession(deviceId: string) {
        try {
            await securityDevicesDatabase.updateOne({deviceId: deviceId}, {$set: {lastActiveDate: new Date()}})
            return true
        } catch (e) {
            return false
        }
    },


    async removeAllSecuritySessions(userId: string, deviceId: string) {
        try {
            await securityDevicesDatabase.deleteMany({userId: userId, deviceId: {$ne: deviceId}})
            return true
        } catch (e) {
            return false
        }
    },

    async removeSecuritySession(deviceId: string) {
        try {
            await securityDevicesDatabase.deleteOne({deviceId: deviceId})
            return true
        } catch (e) {
            return false
        }
    },

}
