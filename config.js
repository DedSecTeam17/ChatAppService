
module.exports={
    ENV:process.env.NODE_ENV || 'development',
    PORT:process.env.PORT || 3000,
    URL:process.env.BASE_URL || 'http://localhsot:3000',
    MONGODB_URI:process.env.MONGODB_URI || 'mongodb://mohamed1337:mohamed1337@ds233323.mlab.com:33323/customers_db'
}

