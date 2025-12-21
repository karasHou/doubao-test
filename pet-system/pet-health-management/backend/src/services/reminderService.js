const cron = require('node-cron');
const { pool } = require('../models');

const checkReminders = async () => {
  try {
    const now = new Date();
    const result = await pool.query(
      'SELECT * FROM reminders WHERE reminder_date <= $1 AND is_sent = false',
      [now]
    );

    result.rows.forEach(reminder => {
      console.log(`Reminder: ${reminder.title} for pet ${reminder.pet_id}`);
      console.log(`Note: ${reminder.notes || 'No notes'}`);
    });

    if (result.rows.length > 0) {
      const reminderIds = result.rows.map(r => r.id);
      await pool.query(
        'UPDATE reminders SET is_sent = true WHERE id = ANY($1)',
        [reminderIds]
      );
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

const startReminderScheduler = () => {
  cron.schedule('* * * * *', () => {
    checkReminders();
  });
  console.log('Reminder scheduler started (runs every minute)');
};

module.exports = {
  startReminderScheduler,
  checkReminders
};