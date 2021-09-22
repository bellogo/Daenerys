module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("Users", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  User.associate = models => {
    User.hasOne(models.Accounts, {
      as: "userAccount",
      foreignKey: "userId",
      onDelete: "cascade",
      hooks: true,
    });

    User.hasMany(models.Beneficiaries, {
      as: "userBeneficiaries",
      foreignKey: "userId",
      onDelete: 'cascade',
      hooks: true, 
    });
  }

  return User;
};