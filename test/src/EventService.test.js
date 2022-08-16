import {connectToMongo} from "../../src/config/config.mongoose";
import EventService from '../../src/service/EventService'

const createEvent = async (input, user) => {
    return EventService.add(input, {filename: 'test'}, user)
}

jest.setTimeout(50000)

describe('Event service', () => {
    beforeAll(async () => {
        await connectToMongo(process.env.DBURL);
    })
    describe('Add event', () => {

        test('Should add event', async () => {
            const input = {
                name: 'Rajd wiosenny',
                emailAlias: 'alias@test.pl',
                startDate: '02-03-2023',
                endDate: '09-03-2023',
                usersEmails: []
            }
            const response = await createEvent(input, {sub: '123', email: 'test'})
            console.log(JSON.stringify(response, null, 2))
            expect(JSON.parse(JSON.stringify(response.data))).toMatchObject({
                _id: expect.any(String),
                forms: [],
                name: 'Rajd wiosenny',
                emailAlias: 'alias@test.pl',
                startDate: '2023-02-02T23:00:00.000Z',
                endDate: '2023-09-02T22:00:00.000Z', //??
                logo:'/static/img/test',
                slug: 'rajd-wiosenny',
                administrators: [
                    expect.objectContaining({
                        email: 'test',
                        role: 'OWNER',
                        userId: '123'
                    })
                ]
            })
        })
    })
})
