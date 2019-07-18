module.exports = (sequelize, DataTypes) => {
    return sequelize.define('songs', {
        song_title: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false
        },
        song_url: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
        {
            timestamps: false
        })
}