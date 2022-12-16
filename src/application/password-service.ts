import bcrypt from 'bcrypt';

export const passwordService = {

    async generateSalt() {
        return await bcrypt.genSalt(10)
    },

    async generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }

}