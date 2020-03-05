import nodemailer, {Transporter} from 'nodemailer'
import {Message} from 'common/Message'
import Response from 'common/Response'
import mongoose from 'mongoose'
import {ParticipiantDoc} from 'models/Participiant'

export interface MailRequest {
    receivers: string[];
    subject: string;
    body: string;
}

async function send(formId: string, mailRequest: MailRequest): Promise<Response<string>> {
    const transporter = await _generateTestTransporter()
    const receivers = await _getReceivers(formId, mailRequest.receivers)
    const sendRequests = receivers.map(receiver => {
        const mailBody = _replaceKeysWithParticipantData(receiver, mailRequest.body)
        return transporter.sendMail({
            from: '"Organizatorzy rajdu👻" <rajd@example.com>',
            to: receiver.field_0,
            subject: mailRequest.subject,
            html: mailBody
        })
    }
    )
    const results = await Promise.all(sendRequests)
    const messages = results.map(r => Message.info(nodemailer.getTestMessageUrl(r).toString()))
    return new Response('success', messages)
}

function _replaceKeysWithParticipantData(participant: ParticipiantDoc, mailBody: string): string {
    return Object.keys(participant)
        .filter(k => k.startsWith('field'))
        .reduce((acc, key) => acc.replace(new RegExp(`{${key}}`, 'g'), participant[key]), mailBody)
}

async function _getReceivers(formId: string, receiversIds: string[]): Promise<ParticipiantDoc[]> {
    const participants = await mongoose.connection.collection(`form_${formId}`).find({}).toArray()
    return receiversIds.map(id => participants.find(p => p._id.toString() === id)).filter(it => it !== undefined)
}

async function _generateTestTransporter(): Promise<Transporter> {
    const testAccount = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    })
}

export default {send}