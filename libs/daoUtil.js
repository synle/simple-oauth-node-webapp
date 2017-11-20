const Sequelize = require('sequelize');
const Table = require('sequelize-simple-adapter');

// if there is a db connection, then use it...
const sequelizeAdapter = !!process.env.MAIN_DB_HOST
    ? new Sequelize(
        process.env.MAIN_DB_NAME,
        process.env.MAIN_DB_USER,
        process.env.MAIN_DB_PASSWORD,
        {
            host: process.env.MAIN_DB_HOST,
            dialect: process.env.MAIN_DB_DIALECT,
            logging: false,
            pool: {
                max: 5,
                min: 0,
            },
            dialectOptions: {
                encrypt: true
            },
        }
    )
    : new Sequelize(
        'db_user', // 'database',
        '',
        '',
        {
            dialect: 'sqlite',
            storage: './db.sqlite3',
            logging: false
        }
    );


// private
// might only need to run for init call...
var promiseDbSync = sequelizeAdapter.sync().then(
  function (argument) {
    console.log('Database ORM Synced... Ready to use', process.env.MAIN_DB_HOST);
  }
);



// definitions
var User = sequelizeAdapter.define('user_access_tokens', {
  id: { type: Sequelize.DataTypes.UUID, defaultValue: Sequelize.DataTypes.UUIDV1, primaryKey: true },
  type:  { type: Sequelize.STRING },
  display_name: { type: Sequelize.STRING },
  user_principal_name: { type: Sequelize.STRING },
  job_title: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  expires_in: { type: Sequelize.DATE },
  ext_expires_in: { type: Sequelize.STRING },
  scope: { type: Sequelize.STRING },
  token_type: { type: Sequelize.STRING },
  access_token: { type: Sequelize.TEXT },
  id_token: { type: Sequelize.TEXT },
  refresh_token: { type: Sequelize.TEXT },
  is_active:  { type: Sequelize.BOOLEAN, defaultValue: false },
});




module.exports = {
  init: async () => {
    await promiseDbSync;
  },
  User: new Table(User, promiseDbSync),
}
