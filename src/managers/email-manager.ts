import {EmailAdapter} from '../adapters/email-adapter';
import {userTypeDB} from '../database/dbInterface';

export const EmailManager = {
    async sendRegistrationEmail(user: userTypeDB) {
        await EmailAdapter.sendEmail(user.accountData.email, 'Registration Confirmation',
            `<h1>Thank for your registration</h1>
       <p>To finish registration please follow the link below:
          <a href='https://somesite.com/confirm-email?${user.emailConfirmation.confirmationCode}'>complete registration</a>
      </p>`
        )
    }
}