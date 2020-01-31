import { connectToMongo } from 'config/config.mongoose'
import { config } from 'config/config'

connectToMongo(config.databaseUrl)
.then(async () => {

    // DEFAULT PLAYGROUND
    // HERE YOU CAN PLAY WITH SERVICES
})
