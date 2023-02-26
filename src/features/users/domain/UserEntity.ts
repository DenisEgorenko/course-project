import {userTypeDB} from '../../../database/dbInterface';
import mongoose, {HydratedDocument, Model} from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import add from 'date-fns/add'

export type UserMethodsType = {
    canBeConfirmed: (code: string) => boolean
    confirm: (code: string) => void
}

type userModelType = Model<userTypeDB, {}, UserMethodsType> & {
    createUser: (
        login: string,
        email: string,
        passwordHash: string,
        passwordSalt: string
    ) => HydratedDocument<userTypeDB>
}

const userSchema = new mongoose.Schema<userTypeDB, userModelType, UserMethodsType>({
    accountData: {
        id: {type: String, required: true},
        login: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        salt: {type: String, required: true},
        refreshToken: {type: String, required: false},
        createdAt: {type: Date, required: true}
    },
    emailConfirmation: {
        confirmationCode: {type: String, required: false},
        expirationDate: {type: Date, required: false},
        isConfirmed: {type: Boolean, required: false}
    },
    passwordRecovery: {
        recoveryCode: {type: String, required: false},
        expirationDate: {type: Date, required: false},
    }
})

userSchema.method('canBeConfirmed', function canBeConfirmed(code: string) {
    const that = this as userTypeDB

    if (that.emailConfirmation.isConfirmed) return false
    if (that.emailConfirmation.confirmationCode !== code) return false
    if (that.emailConfirmation.expirationDate && that.emailConfirmation.expirationDate < new Date()) return false

    return true
})
userSchema.method('confirm', function confirm(code: string) {
    const that = this as userTypeDB & UserMethodsType

    if (!that.canBeConfirmed(code)) throw new Error('Cannot be confirmed')
    if (that.emailConfirmation.isConfirmed) throw new Error('Already Confirmed')

    that.emailConfirmation.isConfirmed = true
    that.emailConfirmation.confirmationCode = null
    that.emailConfirmation.expirationDate = null
})

userSchema.static('createUser', function createUser(login: string,
                                                    email: string,
                                                    passwordHash: string,
                                                    passwordSalt: string) {
    return new User(
        {
            accountData: {
                id: uuidv4(),
                login: login,
                email: email,
                password: passwordHash,
                salt: passwordSalt,
                refreshToken: null,
                createdAt: new Date()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1
                }),
                isConfirmed: false
            },
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null,
            }
        }
    )
})

export const User = mongoose.model<userTypeDB, userModelType>('users', userSchema)