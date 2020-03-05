import nodemailer, {Transporter} from 'nodemailer'
import {Message} from 'common/Message'
import Response from 'common/Response'
import mongoose from 'mongoose'

export interface MailRequest {
    receivers: string[];
    subject: string;
    body: string;
}

async function send(formId: string, mailRequest: MailRequest): Promise<Response<string>> {
    const transporter = await _generateTestTransporter()
    const receiversEmails = await _getReceiversEmails(formId, mailRequest.receivers)
    const sendRequests = receiversEmails.map(email =>
        transporter.sendMail({
            from: '"Organizatorzy rajdu👻" <rajd@example.com>',
            to: email,
            subject: mailRequest.subject,
            html: mailRequest.body
        })
    )
    const results = await Promise.all(sendRequests)
    const messages = results.map(r => Message.info(nodemailer.getTestMessageUrl(r).toString()))
    return new Response('success', messages)
}

async function _getReceiversEmails(formId: string, receiversIds: string[]): Promise<string[]> {
    const participants = await mongoose.connection.collection(`form_${formId}`).find({}).toArray()
    return receiversIds.map(id => participants.find(p => p._id.toString() === id)?.field_0).filter(it => it !== undefined)
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