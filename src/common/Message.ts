import {ErrorCodes} from "common/errorCodes";

export class Message {
    constructor(
        readonly message: string,
        readonly type: MessageType = MessageType.ERROR
    ) {}

    static error(message: string,): Message{
        return new this(message, MessageType.ERROR)
    }

    static info(message: string): Message{
        return new this(message, MessageType.INFO)
    }

    static success(message: string): Message{
        return new this(message, MessageType.SUCCESS)
    }
}

export enum MessageType {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info'
}
