const assert = require('chai').assert;
const rewire = require('rewire');
const KoaFramework = rewire('../koa-framework.js');


describe('Tests for /koa-framework.js', () => {
    /* Test initialisation */
    describe('Test initialisation', () => {
        it('Initialisation with valid options should return a function', async () => {
            let framework = new KoaFramework();
            assert.isDefined(framework, 'Should initialise to a defined value');
        });
    });

    /* Test handle method */
    describe('Test handle() function', () => {
        let framework, standard;
        beforeEach(() => {
            framework = new KoaFramework();
        });
        it('Initialisation the handle function', async () => {
            let result = framework.handle(standard);
            assert.isDefined(result, 'Should return a defined value');
            assert.isFunction(result, 'Should return a function');
        });
        it('Handle a request that returns a valid response', async () => {
            let handler = framework.handle(async (body,headers) => { return { status: 200, type: 'text/json', body: 'OK' } });
            let ctx = {
                request: { headers: {}, body: 'OK' },
                response: {}
            }
            try {
                let result = await handler(ctx);
            } catch (err) {
                assert.isUndefined(err, `Should not throw a ${err.name||'error'}`);
            }
            assert.isDefined(ctx, 'Should return a defined value');
            assert.isObject(ctx.response, 'Response should be an object');
            assert.deepEqual(ctx.response, { status: 200, type: 'text/json', body: 'OK' }, 'Response is not expected value');
        });
        it('Handle a request that throws an error', async () => {
            let handler = framework.handle(async (body,headers) => {
                throw new Error('Test framework error');
            });
            let ctx = {
                request: { headers: {}, body: 'ERROR' },
                response: {}
            }
            try {
                await handler(ctx);
                assert.isTrue(false, 'Should have thrown an error');
            } catch(e) {
                assert.isDefined(e, 'Error should be defined');
                assert.instanceOf(e, Error, 'Should have thrown an Error');
                assert.deepEqual(e.message, 'Test framework error');
            }
        });
    });

    /* Test checl method */
    describe('Test check() function', () => {
        let framework, standard;
        beforeEach(() => {
            framework = new KoaFramework();
        });
        it('Check with invalid context object only', async () => {
            let result = framework.check({ });
            assert.isFalse(result, 'Should indicate context is invalid');
        });
        it('Check with invalid context object and valid done function', async () => {
            let result = framework.check({ }, () => { });
            assert.isFalse(result, 'Should indicate context is invalid');
        });
        it('Check with invalid context object and invalid done function', async () => {
            let result = framework.check({ }, { });
            assert.isFalse(result, 'Should indicate context is invalid');
        });
        it('Check with valid context object only', async () => {
            let result = framework.check({ req: {}, request: {}, res: {}, response: {} });
            assert.isTrue(result, 'Should indicate context is valid');
        });
        it('Check with valid context object and valid done function', async () => {
            let result = framework.check({ req: {}, request: {}, res: {}, response: {} }, () => { });
            assert.isTrue(result, 'Should indicate context is valid');
        });
        it('Check with valid context object and invalid done function', async () => {
            let result = framework.check({ req: {}, request: {}, res: {}, response: {} }, {});
            assert.isFalse(result, 'Should indicate context is invalid');
        });
    });
});
