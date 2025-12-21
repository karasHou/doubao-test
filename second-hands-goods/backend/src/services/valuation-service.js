const DefaultEstimator = require('../estimators/default-estimator');

class ValuationService {
  constructor() {
    this.estimators = new Map();
    this.registerEstimator('default', new DefaultEstimator());
  }

  registerEstimator(name, estimator) {
    this.estimators.set(name, estimator);
  }

  getEstimator(name = 'default') {
    return this.estimators.get(name) || this.estimators.get('default');
  }

  async estimateItem(item, estimatorName = 'default') {
    const estimator = this.getEstimator(estimatorName);
    return await estimator.estimate(item);
  }

  listEstimators() {
    return Array.from(this.estimators.entries()).map(([name, estimator]) => ({
      name,
      description: estimator.description
    }));
  }
}

module.exports = new ValuationService();