import { createServer, getServerPort } from '@devvit/web/server';
import { serverOnRequest } from './server';

const server = createServer(serverOnRequest);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
