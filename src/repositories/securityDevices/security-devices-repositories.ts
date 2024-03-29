import {securityDevice, securityDevicesTypeDB} from '../../database/dbInterface';
import {injectable} from "inversify";

@injectable()
export class SecurityDevicesRepositories {

    async createNewSession(newSession: securityDevicesTypeDB) {
        try {
            const securityDeviceEntity = new securityDevice(newSession)
            await securityDeviceEntity.save()
            return true
        } catch (e) {
            return false
        }
    }

    async updateSession(deviceId: string) {
        try {
            await securityDevice.updateOne({deviceId: deviceId}, {$set: {lastActiveDate: new Date()}})
            return true
        } catch (e) {
            return false
        }
    }

    async removeAllSecuritySessions(userId: string, deviceId: string) {
        try {
            await securityDevice.deleteMany({userId: userId, deviceId: {$ne: deviceId}})
            return true
        } catch (e) {
            return false
        }
    }

    async removeSecuritySession(deviceId: string) {
        try {
            await securityDevice.deleteOne({deviceId: deviceId})
            return true
        } catch (e) {
            return false
        }
    }
}
