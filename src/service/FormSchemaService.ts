import mongoose from 'mongoose'
import {FormSchemaDoc, FormSchemaModel, FormSchemaRequest} from 'models/FormSchema'
import {EventModel} from 'models/Event'
import {logger} from 'common/logger'
import {byIdQuery} from 'common/utils'
import Response from 'common/Response'
import Exception from 'common/Exception'

async function create(
    { details, schema }: FormSchemaRequest,
    eventId: string
): Promise<Response<FormSchemaDoc>> {
    logger.info(`Creating new schema : ${details.name}`)
    const result = await FormSchemaModel.create({
        name: details.name,
        description: details.description,
        colors: {
            primary: details.colors.primaryColor,
            background: details.colors.backgroundColor
        },
        structure: schema
    })
    await Promise.all([
        _createCollection(result),
        _saveSchemaToEvent(eventId, result.slug)
    ])
    return new Response(result)
}

async function _createCollection(schema: FormSchemaDoc): Promise<void> {
    const collection = await mongoose.connection.createCollection(`form_${schema.slug}`)
    const uniqFields = Object.entries(schema.structure)
        .map(([key, definition]) => definition.unique ? key : null)
        .filter(it => it !== null)
    await Promise.all(uniqFields.map(async k => await collection.createIndex({[k]: 1}, {unique: true})))
}

async function getPublic(slug: string): Promise<Response<FormSchemaDoc>> {
    logger.info(`Fetching public schema : ${slug}`)
    const schema = await FormSchemaModel.findOne(byIdQuery(slug)).lean()

    if (!schema) {
        throw Exception.fromMessage(`Not found schema by slug: ${slug}`, 404)
    } else {
        schema.structure = parseToPublic(schema.structure)
        return new Response(schema)
    }
}

async function getPrivate(slug: string): Promise<Response<FormSchemaDoc>> {
    logger.info(`Fetching private schema : ${slug}`)
    const schema = await FormSchemaModel.findOne(byIdQuery(slug)).lean()

    if (!schema) {
        throw Exception.fromMessage(`Not found schema by slug: ${slug}`, 404)
    } else {
        return new Response(schema)
    }
}

async function _saveSchemaToEvent(eventId: string, schemaSlug: string): Promise<Promise<void>> {
    logger.info(`Saving schema (${schemaSlug}) to event : ${eventId}`)

    const result = await EventModel.findOneAndUpdate(
        byIdQuery(eventId),
        { $push: { forms: schemaSlug } }
    )
    if (!result) {
        throw Exception.fromMessage(`There is no event with given id : ${eventId}`)
    }
}

function parseToPublic(schemaStructure: any): any {
    return Object.keys(schemaStructure)
        .reduce((aggregate, key) => (
            !schemaStructure[key].isHidden
                ? {
                    ...aggregate,
                    [key]: schemaStructure[key]
                }
                : aggregate
        ), {})
}

export default {
    create,
    getPrivate,
    getPublic,
    parseToPublic,
}
