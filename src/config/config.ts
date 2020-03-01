import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

export interface Config {
    port: number;
    debugLogging: boolean;
    databaseUrl: string;
    secretKey: string;
    googleClientId: string;
    changelogExpireTime: number;
}

export const config: Config = {
    port: +process.env.PORT || 5000,
    debugLogging: process.env.NODE_ENV == 'development',
    databaseUrl: process.env.DATABASE_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    secretKey: process.env.SECRET_KEY || 'missing-key',
    changelogExpireTime: +process.env.CHANGELOG_EXPIRE_TIME || 3600
}