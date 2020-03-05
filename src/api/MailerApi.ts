import {Body, Controller, Post, Route, Security, Tags} from 'tsoa'
import Response from 'common/Response'
import MailerService, {MailRequest} from 'service/MailerService'

@Route()
@Tags('Mailer')
export class MailerApi extends Controller {

    /**
     * Send mails to given users
     * @param eventId id of the event
     * @param formId id of the form
     */
    @Security('GOOGLE_TOKEN', ['ADMIN'])
    @Post('/events/{eventId}/forms/{formId}/mailer')
    public async sendMails(
        eventId: string,
        formId: string,
        @Body() payload: MailRequest
    ): Promise<Response<string>> {
        return await MailerService.send(formId, payload)
    }
}