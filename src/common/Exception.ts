import {Message} from './Message'

export default class Exception {
    messages: [Message]
    httpCode: number

    constructor(messages: [Message], httpCode = 500) {
        this.messages = messages
        this.httpCode = httpCode
    }

    static fromMessage(message: string, httpCode = 500): Exception {
        return new this([new Message(message)], httpCode)
    }

    toString(): string {
        return this.messages
        .map(m => m.message)
        .join('; ')
    }
}

export function isException(obj: Exception | unknown): obj is Exception {
    return Object.prototype.hasOwnProperty.call(obj, "messages") &&
        Object.prototype.hasOwnProperty.call(obj,'httpCode')
}