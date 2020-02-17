import {Controller, Get, Route, Security, Tags} from 'tsoa'
import Response from 'common/Response'
import {ChangelogDoc} from 'models/Changelog'
import ChangesLogerService from 'service/ChangesLogerService'

@Route()
@Tags('Changelog')
export class ChangelogApi extends Controller {
    /**
     * Get event changelog
     * @param eventId id of the event
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Get('/events/{eventId}/changelog')
    public async getChangelog(eventId: string): Promise<Response<ChangelogDoc[]>> {
        return await ChangesLogerService.findAllLogs(eventId)
    }
}