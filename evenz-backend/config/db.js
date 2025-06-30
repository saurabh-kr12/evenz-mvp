// config/db.js
const mongoose = require('mongoose');
const config = require('config');
const mongoURI = config.get('mongoURI');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`.red);
    process.exit(1);
  }
};

module.exports = connectDB;

/* 
   {
   "app": {
     "name": "Evenz.in"
   },
   "mongoURI": "mongodb://localhost:27017/sayenify",
   "jwtSecret": "your_jwt_secret_key_which_should_be_in_env_var",
   "jwtExpire": "7d",
   "jwtCookieExpire": 7,
   "email": {
     "host": "smtp.example.com",
     "port": 587,
     "secure": false,
     "user": "your-email@example.com",
     "password": "your-email-password",
     "from": "no-reply@example.com"
   },
   "twilio": {
     "accountSid": "your-twilio-account-sid",
     "authToken": "your-twilio-auth-token",
     "phoneNumber": "+1234567890"
   }
 }
 {
  "mongoURI": "mongodb://localhost:27017/sayenify",
  "jwtSecret": "your_jwt_secret_key_which_should_be_in_env_var",
  "jwtExpire": "7d",
  "jwtCookieExpire": 7,
  "emailHost": "smtp.example.com",
  "emailPort": 587,
  "emailSecure": false,
  "emailUser": "no-reply@yourdomain.com",
  "emailPassword": "your_email_password",
  "emailFrom": "no-reply@yourdomain.com",
  "twilioAccountSid": "your_twilio_account_sid",
  "twilioAuthToken": "your_twilio_auth_token",
  "twilioPhoneNumber": "+1234567890"
} 
*/