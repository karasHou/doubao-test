import React from 'react';

function AlertNotification({ alerts }) {
  const getLevelClass = (level) => {
    switch (level) {
      case 'warning':
        return 'alert-warning';
      case 'error':
        return 'alert-error';
      case 'info':
      default:
        return 'alert-info';
    }
  };

  return (
    <div className="alerts-container">
      <h3>异常提醒</h3>
      {alerts.length === 0 ? (
        <p>暂无异常</p>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <div key={index} className={`alert ${getLevelClass(alert.level)}`}>
              <div className="alert-time">
                {new Date(alert.timestamp).toLocaleString()}
              </div>
              <div className="alert-message">{alert.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertNotification;
