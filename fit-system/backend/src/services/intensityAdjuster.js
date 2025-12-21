// 强度调整服务 - 根据训练记录动态调整训练强度

class IntensityAdjuster {
  constructor(pool) {
    this.pool = pool;
  }

  // 根据训练表现调整计划强度
  async adjustIntensity(planId) {
    try {
      // 获取最近的训练记录
      const recordsResult = await this.pool.query(`
        SELECT performance_rating, exercises
        FROM training_records
        WHERE plan_id = $1
        ORDER BY training_date DESC
        LIMIT 5
      `, [planId]);

      const recentRecords = recordsResult.rows;

      if (recentRecords.length === 0) {
        console.log(`No training records found for plan ${planId}, intensity adjustment skipped`);
        return null;
      }

      // 计算平均表现评分
      const avgPerformance = recentRecords.reduce((sum, record) =>
        sum + record.performance_rating, 0) / recentRecords.length;

      // 获取当前计划
      const planResult = await this.pool.query(`
        SELECT * FROM training_plans WHERE id = $1
      `, [planId]);

      if (planResult.rows.length === 0) {
        throw new Error(`Plan not found: ${planId}`);
      }

      const currentPlan = planResult.rows[0];
      let newIntensity = currentPlan.intensity_level;

      // 根据表现调整强度
      if (avgPerformance >= 4.0 && currentPlan.intensity_level < 5) {
        newIntensity = currentPlan.intensity_level + 1;
        console.log(`Increasing intensity for plan ${planId} from ${currentPlan.intensity_level} to ${newIntensity}`);
      } else if (avgPerformance <= 2.0 && currentPlan.intensity_level > 1) {
        newIntensity = currentPlan.intensity_level - 1;
        console.log(`Decreasing intensity for plan ${planId} from ${currentPlan.intensity_level} to ${newIntensity}`);
      }

      // 更新计划强度
      if (newIntensity !== currentPlan.intensity_level) {
        const updateResult = await this.pool.query(`
          UPDATE training_plans
          SET intensity_level = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `, [newIntensity, planId]);

        return updateResult.rows[0];
      }

      return currentPlan;
    } catch (error) {
      console.error('Error adjusting intensity:', error);
      throw error;
    }
  }

  // 批量调整所有计划强度
  async adjustAllIntensities() {
    try {
      const plansResult = await this.pool.query(`
        SELECT id FROM training_plans
      `);

      const adjustmentResults = [];

      for (const plan of plansResult.rows) {
        const result = await this.adjustIntensity(plan.id);
        if (result) {
          adjustmentResults.push(result);
        }
      }

      return adjustmentResults;
    } catch (error) {
      console.error('Error adjusting all intensities:', error);
      throw error;
    }
  }

  // 获取强度调整建议
  async getAdjustmentSuggestions(planId) {
    try {
      // 获取最近的训练记录
      const recordsResult = await this.pool.query(`
        SELECT performance_rating, training_date
        FROM training_records
        WHERE plan_id = $1
        ORDER BY training_date DESC
        LIMIT 10
      `, [planId]);

      const records = recordsResult.rows;

      if (records.length === 0) {
        return {
          plan_id: planId,
          suggestion: 'no_data',
          reason: 'No training records available'
        };
      }

      const avgPerformance = records.reduce((sum, record) =>
        sum + record.performance_rating, 0) / records.length;

      let suggestion = 'maintain';
      let reason = '';

      if (avgPerformance >= 4.0) {
        suggestion = 'increase';
        reason = 'Performance is consistently high, consider increasing intensity';
      } else if (avgPerformance <= 2.0) {
        suggestion = 'decrease';
        reason = 'Performance is consistently low, consider decreasing intensity';
      } else {
        reason = 'Performance is balanced, maintain current intensity';
      }

      return {
        plan_id: planId,
        avg_performance: avgPerformance,
        suggestion,
        reason
      };
    } catch (error) {
      console.error('Error getting adjustment suggestions:', error);
      throw error;
    }
  }
}

module.exports = IntensityAdjuster;
