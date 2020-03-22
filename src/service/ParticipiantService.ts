import mongoose, { Document, Model, model, Schema } from 'mongoose'
import { FormSchemaModel } from 'models/FormSchema'
import FormSchemaService from 'service/FormSchemaService'
import Exception from 'common/Exception'
import Response from 'common/Response'
import { ParticipantResponse, Participiant } from 'models/Participiant'
import { Query } from 'models/Query'
import clog, { CHANGE_TYPE } from 'service/ChangesLogerService'
import { EventModel } from 'models/Event'
import { TokenPayload } from 'google-auth-library'
import Excel from 'exceljs'
import { byIdQuery } from 'common/utils'

export enum ACCESS_TYPE {
    PRIVATE = 'private',
    PUBLIC = 'public'
}

const RANGES_ACCESS: ACCESS_TYPE[] = [ACCESS_TYPE.PUBLIC, ACCESS_TYPE.PRIVATE]

type ParticipantDoc = Document

async function find(formSlug, query: Query): Promise<Response<ParticipantResponse>> {
    if (!await _checkCollectionExists(formSlug)) {
        throw Exception.fromMessage(`Not found collection form_${formSlug}`, 404)
    }

    const page = parseInt(query.page, 10) || parseInt(process.env.DEFAULT_PAGE, 10) || 1
    const count = parseInt(query.count, 10) || parseInt(process.env.DEFAULT_PER_PAGE, 10) || 50

    const filters = _prepareFilters(query)
    const fields = _prepareFields(query)
    const sort = _prepareSortConditions(query)

    const listPromise = mongoose.connection.collection(`form_${formSlug}`)
        .find(filters, fields)
        .skip((page - 1) * count)
        .limit(count)
        .sort(sort)
        .toArray()

    const totalPromise = mongoose.connection.collection(`form_${formSlug}`)
        .countDocuments(filters)

    const [list, total] = [await listPromise, await totalPromise]
    const pages = list.length ? Math.trunc(total / count) || 1 : 0
    // eslint-disable-next-line @typescript-eslint/camelcase
    const meta = { total, pages, current_page: page }

    return new Response({ list, meta }) //TODO: ujednolicić meta response
}

async function add(formSlug: string, type: ACCESS_TYPE, data: Participiant): Promise<Response<ParticipantDoc>> {
    const formModel = await _getModel(formSlug, type)
    const result = await formModel.create(data)
    return new Response(result)
}

async function edit(formSlug: string, query: Record<string, string>, data: Record<string, string>, user: TokenPayload): Promise<Response<ParticipantDoc[]>> {
    const formModel = await _getModel(formSlug, ACCESS_TYPE.PRIVATE)
    const eventId = await _getEventIdFromFormId(formSlug)
    return clog.methodWithMultipleChangelog(
        formModel,
        eventId,
        user,
        query,
        CHANGE_TYPE.EDIT,
        'Zmiana wielu uczestników',
        async () => {
            const allMatching = await formModel.find(query)
            const ids = allMatching.map<string>(p => p._id)
            const result = await formModel.updateMany(query, data)
            if (result?.nModified <= 0) throw Exception.fromMessage(`No Participants were found by given query ${query}`)
            const updatedResult = await formModel.find({ _id: { $in: ids } })
            return new Response(updatedResult)
        }
    )
}

async function editOne(formId: string, participantId: string, data: Record<string, string>, user: TokenPayload): Promise<Response<Participiant>> {
    const formModel = await _getModel(formId, ACCESS_TYPE.PRIVATE)
    const eventId = await _getEventIdFromFormId(formId)
    return clog.methodWithSingleChangelog(
        formModel,
        eventId,
        user,
        participantId,
        CHANGE_TYPE.EDIT,
        'Zmiana uczestnika',
        async () => {
            const result = await formModel.findOneAndUpdate({ _id: participantId }, data, { new: true })
            if (!result) throw Exception.fromMessage(`Could not found Participant by given id: ${participantId}`)
            return new Response(result)
        })
}

async function remove(formId: string, participantId: string, user: TokenPayload): Promise<Response<Participiant>> {
    const formModel = await _getModel(formId, ACCESS_TYPE.PRIVATE)
    const eventId = await _getEventIdFromFormId(formId)
    return clog.methodWithSingleChangelog(
        formModel,
        eventId,
        user,
        participantId,
        CHANGE_TYPE.REMOVE,
        'Usunięcie uczestnika',
        async () => {
            const result = await formModel.findOneAndDelete({ _id: participantId })
            if (!result) throw Exception.fromMessage(`Could not found Participant by given id: ${participantId}`)
            return new Response(result)
        })
}

async function exportExcel(slug: string, user: TokenPayload): Promise<Response<Participiant>> {
    const form = await FormSchemaModel.findOne(byIdQuery(slug)).lean()
    const responseModel = await _getModel(slug, ACCESS_TYPE.PRIVATE)
    const allAnswers = await responseModel.find({})
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet(form.name)
    const headers = []
    const structure = form.structure;
    for(const fieldNum in structure) {
      const name = structure[fieldNum].name ? structure[fieldNum].name : structure[fieldNum][0].name 
      headers.push({ 
        header: name, 
        key: fieldNum, 
        width: name.length + 10,
      })
    }
    worksheet.columns = headers    
    for(const answer of allAnswers) {
      worksheet.addRow(answer)
    }
    return workbook.xlsx.writeFile(`./static/forms/${slug}.xlsx`)
      .then(() => new Response({ data: 'Excel worksheet has been saved.' }))
      .catch(() => new Response({ data: 'Error while saving worksheet.' }))
}

async function _getModel(formSlug, type = ACCESS_TYPE.PUBLIC): Promise<Model<ParticipantDoc>> {
    if (!await _checkCollectionExists(formSlug))
        throw Exception.fromMessage(`Not found collection form_${formSlug}`, 404)

    if (!RANGES_ACCESS.includes(type))
        throw Exception.fromMessage(`Error type range access. Available options: ${RANGES_ACCESS.join(', ')}`)


    const schemaName = `form_${formSlug}_${type}`
    if (mongoose.modelNames().includes(schemaName)) {
        return mongoose.model(schemaName)
    }

    const schema = await FormSchemaModel.findOne({ slug: formSlug })

    if (type === ACCESS_TYPE.PUBLIC) {
        schema.structure = await FormSchemaService.parseToPublic(schema.structure)
    }

    const formSchema = new Schema(schema.structure as any, {
        versionKey: false,
        collection: `form_${formSlug}`
    })

    return model(schemaName, formSchema)
}


async function _checkCollectionExists(formSlug: string): Promise<boolean> {
    const collections = await mongoose.connection.db.listCollections().toArray()
    return collections.some(collection => collection.name === `form_${formSlug}`)
}

function _prepareSortConditions(query: Query): Record<string, number> {
    return query.sort ? Object.keys(query.sort)
        .reduce((aggregate, key) => ({
            ...aggregate, [key]: parseInt(query.sort[key], 10)
        }), {}) : {}
}

function _prepareFields(query: Query): { projection: Record<string, number> } {
    return {
        projection: query.fields
            ? Object.keys(query.fields).reduce((aggregate, key) => ({
                ...aggregate, [key]: parseInt(query.fields[key], 10)
            }), {})
            : {}
    }
}

function _prepareFilters(query: Query): { [p: string]: { $in: string[] } | { $regex: string; $options: string } } {
    return Object.keys(query.filters || {}).reduce((obj, key) => ({
        ...obj,
        [key]: query.filters[key].length > 1
            ? { $in: query.filters[key] }
            : { $regex: `^${query.filters[key][0]}`, $options: 'i' }
    }), {})
}

async function _getEventIdFromFormId(formId: string): Promise<string> {
    const result = await EventModel.findOne({
        'forms': formId
    })
    if (!result) throw Exception.fromMessage(`Nie ma wydarzenia powiązanego z podanym formularzem: ${formId}`)
    return result._id
}

export default {
    add,
    remove,
    edit,
    find,
    editOne,
    exportExcel
}
