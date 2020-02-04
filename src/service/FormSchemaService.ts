import mongoose from 'mongoose'
import {FormSchemaDoc, FormSchemaModel, FormSchemaRequest} from 'models/FormSchema'
import {EventModel} from 'models/Event'
import {logger} from 'common/logger'
import {byIdQuery} from 'common/utils'
import Response from "common/Response";
import Exception from "common/Exception";

const DB_FIELD_KEYS_TO_FRONT_KEYS = {
    name: 'label',
    htmlType: 'type',
    enum: 'values',
    type: 'dataType'
}

async function create(
    {details, schema}: FormSchemaRequest,
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
        mongoose.connection.createCollection(`form_${result.slug}`),
        _saveSchemaToEvent(eventId, result.slug)
    ])
    return new Response(result, 201)
}

async function getPublic(slug: string): Promise<Response<FormSchemaDoc>> {
    logger.info(`Fetching public schema : ${slug}`)
    const schema = await FormSchemaModel.findOne(byIdQuery(slug)).lean()

    if (!schema) {
        throw Exception.fromMessage(`Not found schema by slug: ${slug}`, 404)
    } else {
        schema.structure = parseToPublic(schema.structure)
        return new Response(_parseFormSchema(schema), 200)
    }
}

async function getPrivate(slug: string): Promise<Response<FormSchemaDoc>> {
    logger.info(`Fetching private schema : ${slug}`)
    const schema = await FormSchemaModel.findOne(byIdQuery(slug)).lean()

    if (!schema) {
        throw Exception.fromMessage(`Not found schema by slug: ${slug}`, 404)
    } else {
        return new Response(_parseFormSchema(schema), 200)
    }
}

async function _saveSchemaToEvent(eventId: string, schemaSlug: string): Promise<Promise<void>> {
    logger.info(`Saving schema (${schemaSlug}) to event : ${eventId}`)

    const result = await EventModel.findOneAndUpdate(
        byIdQuery(eventId),
        {$push: {forms: schemaSlug}}
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

function _parseFormSchema({structure, ...rest}: FormSchemaDoc): FormSchemaDoc {
    return {
        ...rest,
        structure: Object.keys(structure)
            .reduce((obj, key) => {
                obj[key] = _mapKeysToFrontFormat(structure[key][0] ? structure[key][0] : structure[key])
                return obj
            }, {})
    } as any
}

function _mapKeysToFrontFormat(fieldObj: any): any {
    return Object.keys(fieldObj)
        .reduce((obj, key) => {
            if (DB_FIELD_KEYS_TO_FRONT_KEYS[key]) {
                obj[DB_FIELD_KEYS_TO_FRONT_KEYS[key]] = fieldObj[key]
            } else {
                obj[key] = fieldObj[key]
            }
            return obj
        }, {})
}

export default {
    create,
    getPrivate,
    getPublic,
    parseToPublic
}
