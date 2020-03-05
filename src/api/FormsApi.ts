import {Controller, Get, Route, Tags} from "tsoa"
import Response from "common/Response"
import {EventPublicDoc} from "models/Event"
import EventService from "service/EventService"

@Route()
@Tags('Forms')
export class FormsApi extends Controller {

    /**
     * Get public event by form id
     * @param formId form id
     */
    @Get('/forms/{formId}/event')
    public async getPublicEvent(formId: string): Promise<Response<EventPublicDoc>> {
        return await EventService.findPublicByFormId(formId)
    }
}
