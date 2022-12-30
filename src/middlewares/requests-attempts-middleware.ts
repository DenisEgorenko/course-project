import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import {httpStatus} from '../types/responseTypes';
import {jwtService} from '../application/jwt-service';
import {usersQueryRepositories} from '../repositories/users/users-query-repositories';
import differenceInSeconds from "date-fns/differenceInSeconds";


type attemptType = {
    ip: string,
    requestsData: {
        url: string,
        attemptsCount: number,
        lastAttempt: Date
    }[]

}

const attemptsData: attemptType[] = []

export const requestsAttemptsAuthorisationMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const nowDate = new Date()
    const maxAttempts = 5
    const limitSecondsRate = 10
    const ipData = attemptsData.find(attempt => attempt.ip === req.ip)

    console.log(req.ip)

    if (!ipData) {
        const newInfo: attemptType = {
            ip: req.ip,
            requestsData: [
                {
                    url: req.url,
                    attemptsCount: 1,
                    lastAttempt: new Date()
                }
            ]
        }
        attemptsData.push(newInfo)
        return next()
    }

    const urlData = ipData.requestsData.find(urlData => urlData.url === req.url)

    if (!urlData) {
        ipData.requestsData.push(
            {
                url: req.url,
                attemptsCount: 1,
                lastAttempt: nowDate
            }
        )
        return next()
    }

    const apiRequestsTime = differenceInSeconds(nowDate, urlData.lastAttempt)

    if (apiRequestsTime > limitSecondsRate) {
        urlData.lastAttempt = nowDate;
        urlData.attemptsCount = 1;
        return next()
    }

    urlData.attemptsCount += 1

    if (apiRequestsTime < limitSecondsRate && urlData.attemptsCount <= maxAttempts) {
        next()
    } else {
        res.sendStatus(httpStatus.TOO_MANY_REQUESTS_429)
        return
    }
}