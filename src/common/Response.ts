import {Message} from "common/Message";

export default class Response<T> {
    constructor(
        readonly data: T,
        readonly httpCode: number = 200,
        readonly messages: Message[] = []
    ) {}
}