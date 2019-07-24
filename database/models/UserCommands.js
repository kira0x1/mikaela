module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user_commands', {
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
        },
        command_name: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        command_args: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false,
        },
        guild_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
        {
            timestamps: true
        })
}