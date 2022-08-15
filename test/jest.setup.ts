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
    DBURL: uri,
    ...process.env,
    ...ENV_VARS,
  };
};
