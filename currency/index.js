const axios = require('axios');
const money = require('money');

const RATES_URL = 'https://api.exchangeratesapi.io/latest';
const BLOCKCHAIN_URL = 'https://blockchain.info/ticker';
const CURRENCY_BITCOIN = 'BTC';

/**
 * Check if one of the currency is BTC
 * @param {String} from - the currency we want to convert
 * @param {String} to - the currency we are going to convert to
 */
const isAnyBTC = (from, to) => [from, to].includes(CURRENCY_BITCOIN);

/**
 * Function that makes the conversion
 */
module.exports = async opts => {
  /**
   * We choose 1 for the amount, USD for the converted currency, BTC for the currency we are converting to 
   */
  const {amount = 1, from = 'USD', to = CURRENCY_BITCOIN} = opts;
  const promises = [];
  let base = from;

  /**
   * check if the from or to value is equal to BTC and we are going to convert to or converting bitcoin
   */
  const anyBTC = isAnyBTC(from, to);

  /**
   * if anyBTC === true and we want to convert from or to Bitcoin we get the rates exchanges from blockchain_url and push them to promises tab
   */
  if (anyBTC) {
    base = from === CURRENCY_BITCOIN ? to : from;
    promises.push(axios(BLOCKCHAIN_URL));
  }

  /**
   * We add to promises the rates exchanges from the base currency (from) to others "famous" currency (BTC is not included in Rates_url that is why we checked before of from was BTC and get BTC rates)
   */
  promises.unshift(axios(`${RATES_URL}?base=${base}`));

  try {
    /**
     * we get a response with the exchange rate of every currency 
     */
    const responses = await Promise.all(promises);
    /**
     * We put all the rates within a tab with the base and the date
     */
    const [rates] = responses;

    /**
     * We get the base/from currency
     */
    money.base = rates.data.base;

    /**
     * We get the rates for the selected currency
     */
    money.rates = rates.data.rates;

    /**
     * We create an array with the from and to currencies
     */
    const conversionOpts = {
      from,
      to
    };

    if (anyBTC) {
      /**
       * We create an array with all the informations about the currencies last buy sell and symbol
       */
      const blockchain = responses.find(response =>
        response.data.hasOwnProperty(base)
      );

      /**
       * We add to the rate between the curency and BTC to money.rates
       */
      Object.assign(money.rates, {
        'BTC': blockchain.data[base].last
      });
    }

    /**
     * We change the from into to so USD into BTC and then to into from so BTC into USD in order to have a BTC --> USD rate
     */
    if (anyBTC) {
      Object.assign(conversionOpts, {
        'from': to,
        'to': from
      });
    }

    /**
     * We return the amount, the conversionOpts with the exchange rate
     */
    return money.convert(amount, conversionOpts);
  } catch (error) {
    throw new Error (
      '💵 Please specify a valid `from` and/or `to` currency value!'
    );
  }
};
