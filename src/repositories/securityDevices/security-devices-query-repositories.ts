import {securityDevicesDatabase, securityDevicesTypeDB} from "../../database/dbInterface";

export const securityDevicesQueryRepositories = {
    async getAllUserSessions(userId: string) {
        const sessions = await securityDevicesDatabase.find({userId: userId}).toArray()
        return sessionsToOutputModel(sessions)
    },

    async findActiveSessionByDeviceId(deviceId: string) {
        const session = await securityDevicesDatabase.find({deviceId: deviceId}).toArray()
        return sessionsToOutputModel(session)
    },

    async findUserIdForActiveSessionByDeviceId(deviceId: string) {
        const session = await securityDevicesDatabase.find({deviceId: deviceId}).toArray()
        return session[0]
    },
}

export const sessionsToOutputModel = (sessions: securityDevicesTypeDB[]): sessionsOutputModel[] => {

    return sessions.map(session => ({
            ip: session.ip,
            title: session.title,
            lastActiveDate: session.lastActiveDate,
            deviceId: session.deviceId
        })
    )
}

export type sessionsOutputModel = {
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string
}



