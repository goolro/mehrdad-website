
    import { handleMiddleware } from './edge-runtime/middleware.ts';
    import handler from './server/node-middleware.js';

    export default (req, context) => handleMiddleware(req, context, handler);
    