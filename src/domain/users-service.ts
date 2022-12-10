import {blogsDatabase, blogTypeDB, userTypeDB} from '../database/dbInterface';
import {CreateBlogInputModel} from '../models/blogs-models/CreateBlogInputModel';
import {blogsRepositories} from '../repositories/blogs/blogs-repositories';
import {UpdateBlogInputModel} from '../models/blogs-models/UpdateBlogInputModel';
import {usersRepositories} from '../repositories/users/users-repositories';
import {CreateUserInputModel} from '../models/users-models/CreateUserInputModel';
import bcrypt from 'bcrypt'
import {authInputModel} from '../models/auth-models/authInputModel';

export type updateBlogQuery = {
    $set: {
        name: string,
        description: string,
        websiteUrl: string,
    }
}

export type UserFilterQuery = {
    id: string
}

export const usersService = {


    async createNewUser(requestData: CreateUserInputModel): Promise<string> {

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(requestData.password, passwordSalt)

        const newUser: userTypeDB = {
            id: (+(new Date())).toString(),
            login: requestData.login,
            email: requestData.email,
            password: passwordHash,
            salt: passwordSalt,
            createdAt: new Date()
        }

        try {
            await usersRepositories.createNewUser(newUser)
            return newUser.id
        } catch (e) {
            return ''
        }
    },

    async checkCredentials(userData: userTypeDB, requestData: authInputModel): Promise<boolean> {

        const passwordHash = await this._generateHash(requestData.password, userData.salt)

        return passwordHash === userData.password;
    },

    async deleteUser(id: string) {
        const filterQuery: UserFilterQuery = {
            id: id
        }
        return await usersRepositories.deleteUser(filterQuery)
    },

    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
}