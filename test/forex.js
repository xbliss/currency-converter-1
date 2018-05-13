describe('Forex test suite', () => {
    const currencies = ['eur', 'usd', 'gbp', 'pln', 'xyz'];
    describe('#constructor', () => {
        it('should accept array of currencies', () => {
            const forexService = new Forex(currencies);
            assert.deepEqual(forexService.currencies, currencies);
        });
        it('should accept a list of currencies', () => {
            const forexService = new Forex(
                currencies[0],
                currencies[1],
                currencies[2],
                currencies[3],
                currencies[4]
            );
            assert.deepEqual(forexService.currencies, currencies);
        });
        it('should throw error if no currencies are given', () => {
            try {
                new Forex();
                assert.fail('Error expected, but none received');
            } catch (error) {
            }
        });
        it('should accept eur and usd and gbp and pln symbols', () => {
            const symbols = ['€', '$', '£', 'zł', 'XYZ'];
            const forexService = new Forex(symbols);
            assert.deepEqual(forexService.currencies, currencies);
        });
        it('should be case insensitive when recognizing currencies', () => {
            const symbols = ['€', 'USD', '£', 'zŁ', 'XYZ'];
            const forexService = new Forex(symbols);
            assert.deepEqual(forexService.currencies, currencies);
        });
    });
    describe('#loadExchangeRates', () => {
        let forexService;
        beforeEach(() => {
            forexService = new Forex(currencies);
            sinon.spy(forexService.forexRepository, 'getRate');
        });
        afterEach(() => {
            forexService.forexRepository.getRate.restore();
        });
        it('should have exchange rates only for currencies defined',
            async () => {
                await forexService.loadExchangeRates();
                assert.deepEqual(Object.keys(forexService.getRates()),
                    currencies);
        });
        it('should cache rates for four hours', async () => {
            await forexService.loadExchangeRates();
            await forexService.loadExchangeRates();
            assert(forexService.forexRepository.getRate.callCount,
                currencies.length);
        });
        it('should load external exchange rates for each defined currency',
            async () => {
                const rate = 10 * Math.random();
                await forexService.loadExchangeRates({usd: rate});
                assert.deepEqual(Object.keys(forexService.getRates()),
                    currencies);
        });
    });
    describe('#getConversionRate', () => {
        let forexService;
        beforeEach(() => {
            forexService = new Forex(currencies);
        });
        it('should return 1 if exchanging the same currency', async () => {
            assert(forexService.getConversionRate('usd', 'usd'), 1);
        });
        it('should correctly return exchange rate between currencies',
            async () => {
                const eurRate = 5;
                const usdRate = 4;
                await forexService.loadExchangeRates({
                    eur: eurRate,
                    usd: usdRate,
                });
                assert(forexService.getConversionRate('eur', 'usd'),
                    eurRate / usdRate);
                assert(forexService.getConversionRate('usd', 'eur'),
                    usdRate / eurRate);
        });
        it(`should throw an error if any of
            the supplied currencies are unknown`, async () => {
                try {
                    await forexService.getConversionRate('xyz', 'usd');
                    assert.fail('expected Error to be thrown');
                } catch (error) {
                }
                try {
                    await forexService.getConversionRate('usd', 'xyz');
                    assert.fail('expected Error to be thrown');
                } catch (error) {
                }
        });
    });
    describe('#convert', () => {
        let forexService;
        beforeEach(() => {
            forexService = new Forex(currencies);
        });
        it('should convert and round output value', async () => {
            const eurRate = 2;
            const usdRate = 1;
            await forexService.loadExchangeRates({
                eur: eurRate,
                usd: usdRate,
            });
            assert(forexService.convert(100.555, 'eur', 'eur'), 100.56);
            assert(forexService.convert(1, 'eur', 'usd'), 2.00);
            assert(forexService.convert(1, 'usd', 'eur'), 0.50);
        });
    });
    describe('#getRate', () => {
        let forexService;
        beforeEach(() => {
            forexService = new Forex(currencies);
            sinon.spy(forexService.forexRepository, 'getRate');
        });
        afterEach(() => {
            forexService.forexRepository.getRate.restore();
        });
        it('should return null for unknown value', async () => {
            const rate = await forexService.getRate('zyx-xyz');
            assert.strictEqual(rate, null);
        });
        it('should cache currency rate for four hours', async () => {
            const rate = await forexService.getRate('usd');
            const rate2 = await forexService.getRate('usd');
            assert(forexService.forexRepository.getRate.calledOnce);
            assert(rate, rate2);
        });
    });
});
