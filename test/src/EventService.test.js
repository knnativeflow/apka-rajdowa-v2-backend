import {connectToMongo} from "../../src/config/config.mongoose";
import mongoose from 'mongoose'

import EventService from '../../src/service/EventService'
import ChangesLogerService from "../../src/service/ChangesLogerService";

const createEvent = async (input, user) => {
  return EventService.add(input, {filename: 'test'}, user)
}

jest.setTimeout(50000)

const clean = it => JSON.parse(JSON.stringify(it))

const USER = {sub: '123', email: 'test'}

const parepreEvent = () => createEvent({
  name: 'Rajd wiosenny',
  emailAlias: 'alias@test.pl',
  startDate: '02-03-2023',
  endDate: '09-03-2023',
  usersEmails: []
}, USER).then(({data}) => data._id)

describe('Event service', () => {
  beforeAll(async () => {
    await connectToMongo(process.env.DBURL);
  })
  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  describe('Add event', () => {

    test('Should add event', async () => {
      const input = {
        name: 'Rajd wiosenny',
        emailAlias: 'alias@test.pl',
        startDate: '02-03-2023',
        endDate: '09-03-2023',
        usersEmails: []
      }
      const response = await createEvent(input, USER)
      expect(clean(response.data)).toMatchObject({
        _id: expect.any(String),
        forms: [],
        name: 'Rajd wiosenny',
        emailAlias: 'alias@test.pl',
        startDate: '2023-02-02T23:00:00.000Z',
        endDate: '2023-09-02T22:00:00.000Z', //??
        logo: '/static/img/test',
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

    test('Should add event with administrators', async () => {
      const input = {
        name: 'Rajd wiosenny',
        emailAlias: 'alias@test.pl',
        startDate: '02-03-2023',
        endDate: '09-03-2023',
        usersEmails: [
            'newsuer@gmail.com'
        ]
      }
      const response = await createEvent(input, USER)
      expect(clean(response.data)).toMatchObject({
        administrators: [
          {
            email: 'test',
            role: 'OWNER',
            userId: '123'
          },
          {
            email: 'newsuer@gmail.com',
            role: 'ADMIN',
          }
        ]
      })
    })
  })

  describe('Update event', () => {
    test('Should update event', async () => {
      const eventId = await parepreEvent()

      const update = {
        name: 'Rajd jesienny',
        startDate: '02-03-2023',
        endDate: '09-03-2023',
      }

      const response = await EventService.update(eventId, update, USER)
      expect(clean(response.data)).toMatchObject({
        name: 'Rajd jesienny',
        startDate: '2023-02-02T23:00:00.000Z',
        endDate: '2023-09-02T22:00:00.000Z', //??
      })
    })

    test('Should throw error if unknown event', async () => {
      const update = {
        name: 'Rajd jesienny',
        startDate: '02-03-2023',
        endDate: '09-03-2023',
      }

      await expect( EventService.update('123123', update, USER)).rejects.toMatchObject({})
    })

    test('Should write change log entry', async () => {
      const eventId = await parepreEvent()

      await EventService.update(eventId, {
        name: 'Rajd jesienny',
        startDate: '02-03-2023',
        endDate: '09-03-2023',
      }, USER)

      const {data: logs} = await ChangesLogerService.findAllLogs(eventId);
      console.log(clean(logs))
      expect(clean(logs)).toMatchObject([{
        user: 'test',
        previousState: expect.objectContaining({
          name: 'Rajd wiosenny',
        }),
        actualState: expect.objectContaining({
          name: 'Rajd jesienny',
        }),
        changeType: 'EDIT',
        description: 'Zmiana ustawień wydarzenia',
        createdAt: expect.any(String)
      }])
    })
  })
})
