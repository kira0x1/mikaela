module.exports = (sequelize, DataTypes) => {
    return sequelize.define('commands', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })
}