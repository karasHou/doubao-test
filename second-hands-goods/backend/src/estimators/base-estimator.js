class BaseEstimator {
  constructor() {
    this.name = 'BaseEstimator';
    this.description = '基础估价器';
  }

  async estimate(item) {
    throw new Error('子类必须实现 estimate 方法');
  }

  calculateDepreciation(originalPrice, ageInMonths, condition) {
    throw new Error('子类必须实现 calculateDepreciation 方法');
  }
}

module.exports = BaseEstimator;