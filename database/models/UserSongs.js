module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user_songs', {
        song_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
        }
    },
        {
            timestamps: false
        })
}