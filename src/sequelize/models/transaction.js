module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transactions", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    flw_ref: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tx_ref: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gateway: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transfer_from: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transfer_to: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  Transaction.associate = models => {
    Transaction.belongsTo(models.Accounts, {
      as: "accountTransaction",
      foreignKey: "accountId",
      onDelete: "cascade",
    });
  };

  return Transaction;
};