import {
    Errback,
    Request as ExpressRequest,
    Response as ExpressResponse,
    NextFunction
} from 'express'
import Exception from 'common/Exception'
import { logger } from 'common/logger'

export default function (
    err: Errback,
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
): void {
    if (_isException(err)) _parseException(err, res)
    else if(isValidationError(err)) _parseValidationError(err, res)
    else if (isNamedError(err)) _parseNamedError(err, res)
    else _parseUnknownError(err, res)
}

function _parseException(err: Exception, res: ExpressResponse): void {
    logger.error('An error occurred: ' + err.toString())
    res.status(err.httpCode)
    res.json({ messages: err.messages })
}

function _parseValidationError(err: ValidatorError, res: ExpressResponse): void {
    const errorMsgs = Object.entries(err.errors)
        .map(([,fieldError]) => fieldError.kind === 'required' ? `Pole ${fieldError.path} jest wymagane!`: '')
    const msg = errorMsgs.join('\n')
    res.status(422).send({messages: [msg]})
}

function _parseNamedError(err: NamedError, res: ExpressResponse): void {
    const msg = `${err.name}: ${(err as any).message}`
    logger.error(msg)
    res.status(500)
    res.send({ messages: [msg] })
}

function _parseUnknownError(err: any, res: ExpressResponse): void {
    logger.error(err)
    res.status(500)
    res.send({ messages: ['Unknown error :' + JSON.stringify(err)] })
}

function _isException(toBeDetermined: any): toBeDetermined is Exception {
    return (toBeDetermined as Exception).httpCode && (toBeDetermined as Exception).messages !== undefined
}

function isValidationError(err: any): err is ValidatorError {
    return err.name === 'ValidationError'
}

function isNamedError(err: any): err is NamedError {
    return err.name && err.message
}

interface ValidatorError {
    name: string;
    errors: Record<string, {
        kind: string;
        path: string;
        value: string;
    }>;
    message: string;
}

interface NamedError {
    name: string;
    message: string;
}