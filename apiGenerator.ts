import { generateRoutes, generateSwaggerSpec, RoutesConfig, SwaggerConfig } from 'tsoa'
import ts from 'ttypescript/lib/typescript'

(async () => {
    const swaggerOptions: SwaggerConfig = {
        basePath: '/api/v1',
        entryFile: './src/server.ts',
        specVersion: 3,
        host: 'localhost:9696',
        schemes: ['http'],
        outputDirectory: './static',
        controllerPathGlobs: ['./src/api/*'],
        securityDefinitions: {
            GOOGLE_TOKEN: {
                type: "apiKey",
                name: "authorization",
                in: "header"
            }
        },
        "specMerging": "recursive",
        "spec": {
            "paths": {
                "/events": {
                    "post": {
                        "consumes": [
                            "multipart/form-data"
                        ],
                        "requestBody": {
                            "content": {
                                "multipart/form-data": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "logo": {
                                                "type": "string",
                                                "format": "binary"
                                            },
                                            "name": {
                                                "type": "string"
                                            },
                                            "emailAlias": {
                                                "type": "string"
                                            },
                                            "startDate": {
                                                "type": "string"
                                            },
                                            "endDate": {
                                                "type": "string"
                                            },
                                            "usersEmails": {
                                                "type": "[string]"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const routeOptions: RoutesConfig = {
        "basePath": "/api/v1",
        "entryFile": "./src/server.ts",
        "routesDir": "./src/api/_auto",
        "authenticationModule": "./src/middlewares/authentication.ts"
    }

    const ignore = [
        "**/node_modules/**",
        "./src/api/_auto/*",
        "./src/static/*"
    ]

    const compilerOptions = {
        "moduleResolution": ts.ModuleResolutionKind.NodeJs,
        "baseUrl": ".",
        "paths": { //This has to be the same config as in tsconfig.json
            "*": [
                "src/*"
            ]
        },
    }

    await generateSwaggerSpec(swaggerOptions, routeOptions, compilerOptions, ignore)

    await generateRoutes(routeOptions, swaggerOptions, compilerOptions, ignore)
})()