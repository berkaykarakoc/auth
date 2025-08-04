const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('../config/database') 

const User = sequelize.define('User', 
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      // Argon2 hashes are typically 95-97 chars, starting with $argon2...
      validate: {
        is: /^\$argon2(id|i|d)\$[a-zA-Z0-9$=,.+/]+$/,
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    schema: 'public',
  },
)

module.exports = User