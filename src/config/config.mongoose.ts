import { logger } from '../common/logger'

import mongoose, {Mongoose} from 'mongoose'

export const connectToMongo = async (url: string): Promise<Mongoose> => {
    mongoose.connection
        .on('connected', () => logger.info('Connected to the database'))
        .on('error', () => logger.error('Error with database connection'))
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on('disconnected', connectToMongo) //TODO: shouldn't be some timeout here??
    return await mongoose.connect(url, {keepAlive: true, useNewUrlParser: true})
}
