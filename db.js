const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

module.exports = mongoose;





//minespacerealty24_db_user

//eU72mn3KQvqDqtcx






// mongodb+srv://minespacerealty24_db_user:eU72mn3KQvqDqtcx@cluster0.eie1icg.mongodb.net/
