module.exports = (sequelize, DataTypes) => {
  const Beneficiary = sequelize.define("Beneficiaries", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    account_bank: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    narration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    callback_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    debit_currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  Beneficiary.associate = models => {
    Beneficiary.belongsTo(models.Users, {
      as: "userBeneficiaries",
      foreignKey: "userId",
    });
  };

  return User;
};