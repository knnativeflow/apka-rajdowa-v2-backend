import {verifyTokenAndFetchUserFromGoogle} from "middlewares/authentication";
import {User, UserModel} from "models/User";
import Response from "common/Response";
import {logger} from "common/logger";

async function verifyAndCreateUser(token: string): Promise<Response<User | null>> {
    const {name, email, picture} = await verifyTokenAndFetchUserFromGoogle(token)

    const result = await UserModel.findOne({'google.email': email})

    if(result)
        return new Response(null, 200)

    logger.info(`Creating new user with name ${name}`)

    const admin = await UserModel.create({
        google: {
            email,
            displayName: name,
            photoUrl: picture
        }
    })

    return new Response(admin, 201)
}

export default {
    verifyAndCreateUser
}