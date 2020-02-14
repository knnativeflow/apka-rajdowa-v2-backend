import {Message} from "common/Message";

export default class Response<T> {
    constructor(
        readonly data: T,
        readonly messages: Message[] = []
    ) {}
}