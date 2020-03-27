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
    port: +_loadEnvVariable('PORT', '5000'),
    debugLogging: _loadEnvVariable('NODE_ENV', 'production') == 'development',
    databaseUrl: _loadEnvVariable('DATABASE_URL'),
    googleClientId: _loadEnvVariable('GOOGLE_CLIENT_ID'),
    secretKey: _loadEnvVariable('SECRET_KEY'),
    changelogExpireTime: +_loadEnvVariable('CHANGELOG_EXPIRE_TIME', '3600')
}

function _loadEnvVariable(name: string, defaultValue?: string): string {
    const value = process.env[name]
    if(!value && !defaultValue) throw `Error: Missing configuration property: ${name}`
    return value ?? defaultValue
}