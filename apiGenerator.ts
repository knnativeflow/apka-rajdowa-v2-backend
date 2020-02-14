import {generateRoutes, generateSwaggerSpec, RoutesConfig, SwaggerConfig} from 'tsoa'
import ts from 'ttypescript/lib/typescript'
import dotenv from 'dotenv'

(async () => {
    dotenv.config({ path: '.env' })
    const isLocal = process.env.NODE_ENV === 'development';

    const swaggerOptions: SwaggerConfig = {
        basePath: '/api/v1',
        entryFile: './src/server.ts',
        specVersion: 3,
        host: isLocal ? 'localhost:9696' : 'apka-rajdowa-v2-dev.herokuapp.com',
        schemes: isLocal ? ['http'] : ['https'],
        outputDirectory: './static',
        controllerPathGlobs: ['./src/api/*'],
        securityDefinitions: {
            GOOGLE_TOKEN: {
                type: 'apiKey',
                name: 'authorization',
                in: 'header'
            }
        },
        'specMerging': 'recursive',
        'spec': {
            'paths': {
                '/events/{eventId}/forms/{id}/participants': {
                    'patch': {
                        'parameters': [
                            {
                                'in': 'query',
                                'name': 'filter',
                                'schema': {
                                    'type': 'object'
                                },
                                'style': 'form',
                                'explode': true
                            },
                            {
                                'description': 'event id',
                                'in': 'path',
                                'name': 'eventId',
                                'required': true,
                                'schema': {
                                    'type': 'string'
                                }
                            },
                            {
                                'description': 'form id',
                                'in': 'path',
                                'name': 'id',
                                'required': true,
                                'schema': {
                                    'type': 'string'
                                }
                            }
                        ]
                    }
                },

                '/events/{eventId}/forms/{id}': {
                    'get': {
                        'parameters': [
                            {
                                'in': 'query',
                                'name': 'query',
                                'schema': {
                                    'type': 'object',
                                    'properties': {
                                        'page': {
                                            'type': 'string'
                                        },
                                        'count': {
                                            'type': 'string'
                                        },
                                        'sort': {
                                            'type': 'object'
                                        },
                                        'fields': {
                                            'type': 'object'
                                        },
                                        'filters': {
                                            'type': 'object'
                                        }
                                    }
                                },
                                'style': 'form',
                                'explode': true
                            },
                            {
                                'description': 'event id',
                                'in': 'path',
                                'name': 'eventId',
                                'required': true,
                                'schema': {
                                    'type': 'string'
                                }
                            },
                            {
                                'description': 'form id',
                                'in': 'path',
                                'name': 'id',
                                'required': true,
                                'schema': {
                                    'type': 'string'
                                }
                            }
                        ]
                    }
                },
                '/events': {
                    'post': {
                        'consumes': [
                            'multipart/form-data'
                        ],
                        'requestBody': {
                            'content': {
                                'multipart/form-data': {
                                    'schema': {
                                        'type': 'object',
                                        'properties': {
                                            'logo': {
                                                'type': 'string',
                                                'format': 'binary'
                                            },
                                            'name': {
                                                'type': 'string'
                                            },
                                            'emailAlias': {
                                                'type': 'string'
                                            },
                                            'startDate': {
                                                'type': 'string'
                                            },
                                            'endDate': {
                                                'type': 'string'
                                            },
                                            'usersEmails': {
                                                'type': '[string]'
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
        'basePath': '/api/v1',
        'entryFile': './src/server.ts',
        'routesDir': './src/api/_auto',
        'authenticationModule': './src/middlewares/authentication.ts'
    }

    const ignore = [
        '**/node_modules/**',
        './src/api/_auto/*',
        './src/static/*'
    ]

    const compilerOptions = {
        'moduleResolution': ts.ModuleResolutionKind.NodeJs,
        'baseUrl': '.',
        'paths': { //This has to be the same config as in tsconfig.json
            '*': [
                'src/*'
            ]
        }
    }

    await generateSwaggerSpec(swaggerOptions, routeOptions, compilerOptions, ignore)

    await generateRoutes(routeOptions, swaggerOptions, compilerOptions, ignore)
})()