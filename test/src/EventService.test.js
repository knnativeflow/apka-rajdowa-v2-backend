import {connectToMongo} from "../../src/config/config.mongoose";
import mongoose from 'mongoose'

import EventService from '../../src/service/EventService'
import ChangesLogerService from "../../src/service/ChangesLogerService";
import {EventModel} from "../../src/models/Event";
import {UserModel} from "../../src/models/User";

jest.mock('@aws-sdk/client-s3');

const createEvent = async (input, user) => {
  return EventService.add(input, {buffer: new Buffer(''), mimetype: 'xx'}, user)
}

//Currently the service methods returns objects with tons of garbage from mongoose, until it will be addressed we need to clean to response to do the assertions
const clean = it => JSON.parse(JSON.stringify(it))

const USER = {sub: '123', email: 'test@gmail.com'}
const USER_2 = {sub: '321', email: 'test2@gmail.com'}

const parepreEvent = (override = {}, user = USER) => createEvent({
  name: 'Rajd wiosenny',
  emailAlias: 'alias@test.pl',
  startDate: '02-03-2023',
  endDate: '09-03-2023',
  usersEmails: [],
  ...override
}, user).then(({data}) => data._id.toString())

describe('Event service', () => {
  beforeAll(async () => {
    await connectToMongo(process.env.DATABASE_URL);
  })
  beforeEach(async () => {
    await mongoose.connection.dropDatabase();

    await UserModel.create({
      userId: USER_2.sub,
      google: {
        email: USER_2.email,
        displayName: 'Test user',
        photoUrl: 'picture.jpg'
      }
    })
  });

  describe('Add event', () => {

    test('Validation error when missing required fields', async () => {
      //missing name
      await expect(createEvent({
        emailAlias: 'alias@test.pl',
        startDate: '02-03-2023',
        endDate: '09-03-2023',
        usersEmails: []
      }, USER)).rejects.toMatchObject({name: 'ValidationError'})

      //missing email
      await expect(createEvent({
        name: 'Rajd',
        startDate: '02-03-2023',
        endDate: '09-03-2023',
        usersEmails: []
      }, USER)).rejects.toMatchObject({name: 'ValidationError'})

      //missing start date
      await expect(createEvent({
        name: 'Rajd',
        emailAlias: 'alias@test.pl',
        endDate: '09-03-2023',
        usersEmails: []
      }, USER)).rejects.toMatchObject({name: 'ValidationError'})

      //missing end date
      await expect(createEvent({
        name: 'Rajd',
        emailAlias: 'alias@test.pl',
        startDate: '02-03-2023',
        usersEmails: []
      }, USER)).rejects.toMatchObject({name: 'ValidationError'})
    })

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
        //TODO: fix parsing event dates
        // startDate: '2023-02-02T23:00:00.000Z',
        // endDate: '2023-09-02T22:00:00.000Z', //??
        logo: 'https://apka-rajdowa-prod.s3.eu-central-1.amazonaws.com/img/logo/rajd-wiosenny',
        slug: 'rajd-wiosenny',
        administrators: [
          expect.objectContaining({
            email: 'test@gmail.com',
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
          'newsuer@gmail.com',
          USER_2.email
        ]
      }
      const response = await createEvent(input, USER)
      expect(clean(response.data)).toMatchObject({
        administrators: [
          {
            email: 'test@gmail.com',
            role: 'OWNER',
            userId: '123'
          },
          {
            email: 'newsuer@gmail.com',
            role: 'ADMIN',
            userId: 'newsuer@gmail.com',
          },
          {
            email: 'test2@gmail.com',
            role: 'ADMIN',
            userId: '321',
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
        // startDate: '2023-02-02T23:00:00.000Z',
        // endDate: '2023-09-02T22:00:00.000Z', //??
      })
    })

    test('Should throw error if unknown event', async () => {
      const update = {
        name: 'Rajd jesienny',
        startDate: '02-03-2023',
        endDate: '09-03-2023',
      }

      await expect(EventService.update('123123', update, USER)).rejects.toMatchObject({httpCode: 404})
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
        user: 'test@gmail.com',
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

  describe('Remove event', () => {

    test('Should remove event', async () => {
      const eventId = await parepreEvent()
      const response = await EventService.remove(eventId);
      expect(clean(response.data)._id.toString()).toEqual(eventId.toString());

      const event = await EventModel.findOne({_id: eventId});
      expect(event).toBeNull()
    })

    //TODO: assert on dropping collections
  })

  describe('Find', () => {

    test('Should return all events user has access', async () => {
      await parepreEvent({usersEmails: [USER_2.email]})
      await parepreEvent({emailAlias: 'alias2@test.pl', name: 'Rajd jesienny'}, USER_2)

      const response1 = await EventService.findAll(USER);
      //then: USER has access only to event created by himself
      expect(clean(response1.data)).toMatchObject([{name: 'Rajd wiosenny'}])

      const response2 = await EventService.findAll(USER_2);
      //and: USER_2 has access to event created by himself and other one where has admin role
      expect(clean(response2.data)).toMatchObject([{name: 'Rajd wiosenny'}, {name: 'Rajd jesienny'}])

    })

    test('Should return event by id', async () => {
      const id = await parepreEvent()

      const response = await EventService.findById(id);
      expect(clean(response.data)).toMatchObject({name: 'Rajd wiosenny'})
    })

    test('Should throw 404 when event does not exists', async () => {
      await expect(EventService.findById('123')).rejects.toMatchObject({httpCode: 404})
    })


    //TODO: Find by form id
  })
})
