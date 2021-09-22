module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define("Accounts", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Account.associate = models => {
    Account.belongsTo(models.Users, {
      as: "userAccount",
      foreignKey: "userId",
    });

    Account.hasMany(models.Transactions, {
      as: "accountTansactions",
      foreignKey: "accountId",
      onDelete: 'cascade',
      hooks: true, 
    });
  };

  return Account;
};

