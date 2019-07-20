module.exports = (sequelize, DataTypes) => {
    return sequelize.define('songs', {
        song_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        song_title: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        song_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        song_duration: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
        {
            timestamps: false
        })
}