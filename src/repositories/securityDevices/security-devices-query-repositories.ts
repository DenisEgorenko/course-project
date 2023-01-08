import {securityDevice, securityDevicesTypeDB} from "../../database/dbInterface";

export const securityDevicesQueryRepositories = {
    async getAllUserSessions(userId: string) {
        const sessions = await securityDevice.find({userId})
        return sessionsToOutputModel(sessions)
    },

    async findActiveSessionByDeviceId(deviceId: string) {
        const session = await securityDevice.find({deviceId})
        return sessionsToOutputModel(session)
    },

    async findAllInfoForActiveSessionByDeviceId(deviceId: string) {
        const session = await securityDevice.find({deviceId})
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



