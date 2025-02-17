const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// import schema from Photo.js
const photoSchema = require('./Photo');

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },

    // set savedPhotos to be an array of data that adheres to the photoSchema
    myPhotos: [photoSchema],
  
  },
   {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// when we query a user, we'll also get another field called `photoCount` with the number of saved photos we have
userSchema.virtual('photoCount').get(function () {
  return this.savedPhotos.length;
});

const User = model('User', userSchema);

module.exports = User;