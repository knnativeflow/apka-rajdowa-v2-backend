import express, {Errback, NextFunction, Request as ExpressRequest, Response as ExpressResponse} from 'express'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import * as swaggerUI from 'swagger-ui-express'
import fs from 'fs'
import cors from 'cors'
import requestLogger from './middlewares/requestLogger'
import 'reflect-metadata'
import { connectToMongo } from 'config/config.mongoose'
import { logger } from 'common/logger'
import { config } from 'config/config'
import { RegisterRoutes } from 'api/_auto/routes'
import exceptionHandler from './middlewares/exceptionMapper'
import path from 'path'

(async function setup() {

    const app = express()
    const server = http.createServer(app)

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(cors())
    app.use(requestLogger)
    RegisterRoutes(app)
    app.use(exceptionHandler)
    app.use('/api/v1/static', express.static(path.join(__dirname, '../static'), {fallthrough: false}))
    app.use((err: Errback, req: ExpressRequest, res: ExpressResponse, next: NextFunction)=> {
        fs.createReadStream(`static/img/default.png`).pipe(res)
    })
    app.use('/api/v1/swagger', swaggerUI.serve, swaggerUI.setup(require('../static/swagger.json')))

    await connectToMongo(config.databaseUrl)
    server.listen(config.port)
    logger.info(`Server running on port : ${config.port}`)
})()
