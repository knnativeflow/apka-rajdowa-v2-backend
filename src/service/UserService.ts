import {UserModel} from "models/User";
import {Administrator, USER_ROLE} from "models/Administrator";
import {Message} from "common/Message";
import {ErrorCodes} from "common/errorCodes";

async function parseEmailsToUsers(emails: string[], messages: Message[]): Promise<Administrator[]> {
    return Promise.all(
        emails.map(async email => {
            const result = await UserModel.findOne({ 'google.email': email })
            if (result) {
                return { userId: result._id, role: USER_ROLE.ADMIN, email }

            } else {
                messages.push(Message.error(ErrorCodes.USER_IS_NEW, [email]))
                // This email will be replace by user id after user first login
                return { userId: email, role: USER_ROLE.ADMIN, email }
            }
        })
    )
}

export default  {
    parseEmailsToUsers
}
