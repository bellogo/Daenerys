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
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipient_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

  });

  Beneficiary.associate = models => {
    Beneficiary.belongsTo(models.Users, {
      as: "userBeneficiaries",
      foreignKey: "userId",
    });
  };

  return Beneficiary;
};