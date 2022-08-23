import { MongoMemoryServer } from 'mongodb-memory-server';

const ENV_VARS = {};

const MONGO_CONFIG = {
  binary: {
    version: '4.4.12',
  },
};

export default async () => {
  const mongo = await MongoMemoryServer.create(MONGO_CONFIG);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global._mongo = mongo;
  const uri = mongo.getUri();

  process.env = {
    DATABASE_URL: uri,
    GOOGLE_CLIENT_ID: '123',
    SECRET_KEY: '123',
    AWS_ACCESS_KEY_ID: '123',
    AWS_SECRET_ACCESS_KEY: '123',
    ...process.env,
    ...ENV_VARS,
  };
};
