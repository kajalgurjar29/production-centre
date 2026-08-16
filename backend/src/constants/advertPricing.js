// Placeholder pricing until real rates are supplied - flat rate per day by
// advert type, in GBP. Update these once the business confirms real pricing;
// nothing else needs to change since totalCost is always computed from here.
const RATE_PER_DAY_GBP = {
  Banner: 2,
  'Side Card': 1,
  Featured: 3,
};
const DEFAULT_RATE_PER_DAY_GBP = 1;
const MIN_DURATION_DAYS = 100;

function calculateTotalCost(type, durationDays) {
  const rate = RATE_PER_DAY_GBP[type] || DEFAULT_RATE_PER_DAY_GBP;
  return Number((rate * durationDays).toFixed(2));
}

module.exports = { RATE_PER_DAY_GBP, DEFAULT_RATE_PER_DAY_GBP, MIN_DURATION_DAYS, calculateTotalCost };
