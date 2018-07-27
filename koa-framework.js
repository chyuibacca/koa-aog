/*
 * Actions on Google SDK Framework implementation for Koa.
 */
class KoaFramework {
    handle(standard) {
        return async (ctx) => {
            const result = await standard(ctx.request.body, ctx.request.headers).catch(e => {
                throw e;
            })

            if (result) {
                const {status, body} = result;
                ctx.response.status = status;
                ctx.response.type = 'text/json';
                ctx.response.body = body;
            }
        }
    }

    check(first, second, third) {
        //Check first arg is a Koa context and second arg is undefined or a function
        return typeof first.req === 'object' && typeof first.request === 'object'
            && typeof first.res === 'object' && typeof first.response === 'object'
            && (second==undefined || (typeof second === 'function'));
    }
}

module.exports = KoaFramework;