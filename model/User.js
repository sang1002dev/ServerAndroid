const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    // khai báo thuộc tính đối tượng
    email: String,
    password: String,
    repassword: String,
});
const User = mongoose.model("User",UserSchema);
module.exports = User;