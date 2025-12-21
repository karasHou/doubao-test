const BaseEstimator = require('./base-estimator');

class DefaultEstimator extends BaseEstimator {
  constructor() {
    super();
    this.name = 'DefaultEstimator';
    this.description = '默认估价器';
  }

  async estimate(item) {
    const { original_price, condition, purchase_date } = item;

    if (!original_price) return 0;

    const ageInMonths = this.calculateAgeInMonths(purchase_date);
    const depreciationRate = this.calculateDepreciationRate(condition);
    const baseValue = original_price * (1 - depreciationRate);

    const ageDepreciation = this.calculateAgeDepreciation(baseValue, ageInMonths);

    const estimatedPrice = Math.max(baseValue - ageDepreciation, original_price * 0.1);

    return Math.round(estimatedPrice * 100) / 100;
  }

  calculateAgeInMonths(purchaseDate) {
    if (!purchaseDate) return 0;

    const now = new Date();
    const purchase = new Date(purchaseDate);
    const diffYears = now.getFullYear() - purchase.getFullYear();
    const diffMonths = now.getMonth() - purchase.getMonth();

    return diffYears * 12 + diffMonths;
  }

  calculateDepreciationRate(condition) {
    const rates = {
      5: 0.1,
      4: 0.2,
      3: 0.4,
      2: 0.6,
      1: 0.8
    };

    return rates[condition] || 0.5;
  }

  calculateAgeDepreciation(baseValue, ageInMonths) {
    const monthlyRate = 0.02;
    return baseValue * (monthlyRate * Math.min(ageInMonths, 60));
  }
}

module.exports = DefaultEstimator;