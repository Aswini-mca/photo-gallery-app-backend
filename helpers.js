import { User } from "./models/user.js";
import bcrypt from "bcrypt";
import randomstring from "randomstring";

async function getUserByName(req) {
  return await User.findOne({ userName: req.body.userName });
}

async function genPassword(password) {
  const salt = await bcrypt.genSalt(15);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function getUserByEmail(req) {
  return await User.findOne({ email: req.body.email });
}

function genToken() {
  const resetToken = randomstring.generate(20);
  return resetToken;
}

async function storeResetToken(resetToken, userFromDB, resetTokenExpiresAt) {
  return await User.findOneAndUpdate(
    { _id: userFromDB._id },
    { resetToken: resetToken, resetTokenExpiresAt: resetTokenExpiresAt }
  );
}

async function getUserByResetToken(token) {
  return User.findOne({ resetToken: token });
}

async function updateNewPassword(resetToken, hashedPassword) {
  return await User.findOneAndUpdate(
    { _id: resetToken._id },
    {
      password: hashedPassword,
      confirmPassword: hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    }
  );
}

async function getUserById(userId) {
  return await User.findById(userId).select("_id name");
}

export {
  getUserByName,
  genPassword,
  getUserByEmail,
  genToken,
  storeResetToken,
  getUserByResetToken,
  updateNewPassword,
  getUserById,
};
