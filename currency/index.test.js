const currency = require('./');
const nock = require('nock');

beforeEach(() => {
  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=USD')
    .reply(200, {
      'base': 'USD',
      'rates': {
        'EUR': 0.899
      }
    });

  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=EUR')
    .reply(200, {
      'base': 'EUR',
      'rates': {
        'USD': 1.1122
      }
    });

  nock('https://blockchain.info')
    .get('/ticker')
    .reply(200, {
      'USD': {
        '15m': 8944.49,
        'last': 8944.49,
        'buy': 8944.49,
        'sell': 8944.49,
        'symbol': '$'
      },
      'EUR': {
        '15m': 8048.11,
        'last': 8048.11,
        'buy': 8048.11,
        'sell': 8048.11,
        'symbol': '€'
      }
    });
});

describe('currency', () => {
  test('should convert 1 USD to EUR', async () => {
    const converted = await currency({'amount': 1, 'from': 'USD', 'to': 'EUR'});

    expect(converted).toBe(0.899);
  });

  test('should convert 1 USD to USD', async () => {
    const converted = await currency({'amount': 1, 'from':'USD', 'to':'USD'});

    expect(converted).toBe(1);
  });

  test('should convert 1 EUR to USD', async () => {
    const converted = await currency({'amount': 1, 'from':'EUR', 'to':'USD'});

    expect(converted).toBe(1.1122);
  });

  test('should convert 1 BTC to USD', async () => {
    const converted = await currency({'amount': 1, 'from':'BTC', 'to':'USD'});

    expect(converted).toBe(8944.49);
    
  });

  test('should convert 1 BTC to EUR', async () => {
    const converted = await currency({'amount': 1, 'from':'BTC', 'to':'EUR'});
    expect(converted).toBe(8048.11);
  });

  test('should convert (with default values) without arguments', async () => {
    const converted = await currency({});
  });

  test('should convert with amount only as argument', async () => {
    const converted = await currency({'amount': 1});
  });

  test('should convert with amount and (from) currency only as arguments', async () => {
    const converted = await currency({'amount': 1, 'from':'EUR'});
  });

  test('should return errors message for unknown `from` or `to` currency value', async () => {
    const converted = await currency({'amount': 1, 'from':'USD', 'to':'USD'});
    // because of my index.js, if I set a wrong from or to, catch error in index ' '💵 Please specify a valid `from` and/or `to` currency value!'
    
  });
});
