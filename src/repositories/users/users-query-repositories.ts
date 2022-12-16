import {
    blogsDatabase,
    blogTypeDB,
    postsDatabase,
    postTypeDB,
    usersDatabase,
    userTypeDB
} from '../../database/dbInterface';
import {Sort, WithId} from 'mongodb';
import {usersQueryModel} from '../../models/users-models/usersQueryModel';


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

        const totalCount = await usersDatabase.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize)

        const items = await usersDatabase.find(filter, {projection: {_id: 0}}).sort(sort).skip(skip).limit(pageSize).toArray();

        return usersToOutputModel(pagesCount, pageNumber, pageSize, totalCount, items)
    },

    async getUserById(id: string) {
        const foundBlog = await usersDatabase.find({'accountData.id': id}, {projection: {_id: 0}}).toArray()
        return userToOutputModel(foundBlog[0])
    },


    async getUserByIdAuth(id: string) {
        const foundUser = await usersDatabase.find({
            'accountData.id': id
        }, {projection: {_id: 0}}).toArray()

        if (foundUser.length) {
            return userToAuthOutputModel(foundUser[0])
        } else {
            return null
        }
    },


    async getUserByEmailOrLogin(login?: string, email?: string) {
        const foundBlog = await usersDatabase.find(
            {$or: [{'accountData.email': email ? email : login}, {'accountData.login': login ? login : email}]}, {projection: {_id: 0}}
        ).toArray()
        return foundBlog[0]
    },


    // async getUserByEmailOrLogin(loginOrEmail: string) {
    //     const foundBlog = await usersDatabase.find(
    //         {$or: [{'accountData.email': loginOrEmail}, {'accountData.login': loginOrEmail}]}, {projection: {_id: 0}}
    //     ).toArray()
    //     return foundBlog[0]
    // },

    async getUserByConfirmationCode(code: string) {
        const foundBlog = await usersDatabase.find(
            {'emailConfirmation.confirmationCode': code}, {projection: {_id: 0}}
        ).toArray()
        return foundBlog[0]
    }
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

