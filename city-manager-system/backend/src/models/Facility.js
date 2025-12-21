const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Facility = sequelize.define('Facility', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('toilet', 'hospital', 'charging_station'),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    rating: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    open_time: {
      type: DataTypes.STRING,
      defaultValue: '24小时'
    }
  }, {
    tableName: 'facilities',
    timestamps: true
  });

  Facility.prototype.calculateDistance = function(lat, lng) {
    const R = 6371;
    const dLat = (lat - this.latitude) * Math.PI / 180;
    const dLng = (lng - this.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(2));
  };

  return Facility;
};
