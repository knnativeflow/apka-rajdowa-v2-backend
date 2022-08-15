import { Connection, connections } from 'mongoose';

/**
 * We need to ensure that every database connection is closed after finishing each test suite,
 * to avoid having async operations that kept running after all tests finished,
 * causing jest is not closing naturally without forceExit flag.
 */
afterAll(async () => Promise.all(connections.map((it: Connection) => it.close())));
