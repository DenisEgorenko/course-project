import {Sort, WithId} from 'mongodb';
import {usersQueryModel} from '../domain/models/usersQueryModel';
import {User} from '../domain/UserEntity';
import {userTypeDB} from '../../../database/dbInterface';


export const usersQueryRepositories = {
    async getAllUsers(query: usersQueryModel) {

        const filter: { $or: any[] } =
            {$or: []}

        if (query.searchEmailTerm) {
            filter.$or.push({'accountData.email': new RegExp(query.searchEmailTerm, 'i')})
        }

        if (query.searchLoginTerm) {
            filter.$or.push({'accountData.login': new RegExp(query.searchLoginTerm, 'i')})
        }

        if (!filter.$or.length) {
            filter.$or.push({})
        }

        const sortBy = query.sortBy ? query.sortBy : 'createdAt'
        const sortDirection: Sort = query.sortDirection === 'asc' ? 1 : -1
        const sort = {[sortBy]: sortDirection}

        const pageSize: number = query.pageSize ? +query.pageSize : 10
        const pageNumber: number = query.pageNumber ? +query.pageNumber : 1

        const skip: number = pageSize * (pageNumber - 1)

        const totalCount = await User.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await User.find(filter).sort(sort).skip(skip).limit(pageSize)

        return usersToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getUserById(id: string) {
        const foundBlog = await User.find({'accountData.id': id}, {projection: {_id: 0}})
        return userToOutputModel(foundBlog[0])
    },

    async getUserRefreshTokenById(id: string) {
        const foundBlog = await User.find({'accountData.id': id}, {projection: {_id: 0}})
        return foundBlog[0].accountData.refreshToken
    },

    async getUserByIdAuth(id: string) {
        const foundUser = await User.find({
            'accountData.id': id
        }, {projection: {_id: 0}})

        if (foundUser.length) {
            return userToAuthOutputModel(foundUser[0])
        } else {
            return null
        }
    },

    async getUserByEmailOrLogin(login?: string, email?: string) {
        const foundBlog = await User.find(
            {$or: [{'accountData.email': email ? email : login}, {'accountData.login': login ? login : email}]})
        return foundBlog[0]
    },

    async getUserByConfirmationCode(code: string) {
        const foundUser = await User.find(
            {'emailConfirmation.confirmationCode': code}
        )
        return foundUser[0]
    },

    async getUserByRecoveryCode(recoveryCode: string) {
        const foundUser = await User.find(
            {'passwordRecovery.recoveryCode': recoveryCode}
        )
        return foundUser[0]
    },
}

export const usersToOutputModel = (pagesCount: number,
                                   page: number,
                                   pageSize: number,
                                   totalCount: number,
                                   items: userTypeDB[]
): usersOutputModel => {

    return {
        pagesCount: pagesCount,
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
        items: items.map(user => ({
            id: user.accountData.id,
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }))
    }
}


export const userToOutputModel = (user: WithId<userTypeDB>): userOutputModel => {

    return {
        id: user.accountData.id,
        login: user.accountData.login,
        email: user.accountData.email,
        createdAt: user.accountData.createdAt
    }
}


export const userToAuthOutputModel = (user: WithId<userTypeDB>): authUserOutputModel => {

    return {
        userId: user.accountData.id,
        login: user.accountData.login,
        email: user.accountData.email,
    }
}


export type usersOutputModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: userOutputModel[]
}

export type userOutputModel = {
    id: string,
    login: string,
    email: string,
    createdAt: Date
}

export type authUserOutputModel = {
    userId: string,
    login: string,
    email: string,
}

