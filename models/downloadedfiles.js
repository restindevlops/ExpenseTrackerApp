const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Downloadedfiles = sequelize.define('downloadedfile', {

  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    autoNull: false,
    primaryKey: true
  },

  fileURL: {
    type: Sequelize.TEXT,
    autoNull: false,
  },
  fileName: {
    type: Sequelize.TEXT,
    autoNull: false,
  },
});

module.exports = Downloadedfiles;