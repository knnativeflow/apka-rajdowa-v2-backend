import { EventModel } from "models/Event"
import Exception from "./Exception"

export function isObjectID(text: string): boolean {
    const regex = new RegExp('^[0-9a-fA-F]{24}$')
    return regex.test(text)
}

export function byIdQuery(id: string): {_id: string} | {slug: string} {
    return isObjectID(id)
        ? { _id: id }
        : { slug: id }
}

export async function getEventIdFromFormId(formId: string): Promise<string> {
    const result = await EventModel.findOne({
        'forms': formId
    })
    if(!result) throw Exception.fromMessage(`Nie ma wydarzenia powiązanego z podanym formularzem: ${formId}`)
    return result._id
}
