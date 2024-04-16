import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import nodemailer from "nodemailer";
import {
  getUserByName,
  genPassword,
  getUserByEmail,
  genToken,
  storeResetToken,
  getUserByResetToken,
  updateNewPassword,
} from "../helpers.js";

const router = express.Router();

//sign up API
router.post("/signup", async (req, res) => {
  const { userName, email, password, confirmPassword } = req.body;
  let user = await getUserByName(req);
  try {
    //validate username & required fields
    if (user) {
      return res.status(400).send({ error: "Username already exists" });
    }
    if (!userName) {
      return res.status(400).send({ error: "Username field is required" });
    }
    if (!email) {
      return res.status(400).send({ error: "E-Mail field is required" });
    }
    //validate email pattern
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return res.status(400).send({ error: "Email pattern does not match" });
    }
    if (!password) {
      return res.status(400).send({ error: "Password field is required" });
    }
    //validate password pattern
    if (
      !/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[#!@%$_]).{8,}$/g.test(
        password
      )
    ) {
      return res.status(400).send({ error: "Password pattern does not match" });
    }
    if (!confirmPassword) {
      return res
        .status(400)
        .send({ error: "Re-Enter Password field is required" });
    }
    //validate confirm password pattern
    if (
      !/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[#!@%$_]).{8,}$/g.test(
        confirmPassword
      )
    ) {
      return res
        .status(400)
        .send({ error: "Re-Enter Password pattern does not match" });
    }
    //check Password and confirmPassword are same
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password and Re-Enter password are not same" });
    }
    const hashedPassword = await genPassword(password);
    user = new User({
      userName,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    }).save();
    res.status(201).json({ message: "Successfully Created User Account" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//login API
router.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  const userFromDB = await getUserByName(req);
  try {
    //validate required Fields
    if (!userName) {
      return res.status(400).send({ error: "Username is required" });
    }
    if (!password) {
      return res.status(400).send({ error: "Password is required" });
    }
    //validate username
    if (!userFromDB) {
      return res.status(400).send({ error: "Invalid Credentials" });
    }

    const storedDbPassword = userFromDB.password;
    const isPasswordMatch = await bcrypt.compare(password, storedDbPassword);

    if (!isPasswordMatch) {
      return res.status(400).send({ error: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: userFromDB._id }, process.env.secret_key);
    res.status(201).json({ message: "Login successfully", token });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

//forget password API
router.post("/forget-password", async (req, res) => {
  const { email } = req.body;
  let userFromDB = await getUserByEmail(req);

  //validate required Field
  if (!email) {
    return res.status(400).send({ error: "E-mail Id is required" });
  }

  //validate username
  if (!userFromDB) {
    return res.status(400).send({ error: "Invalid Credentials" });
  }
  //generating random string
  const resetToken = genToken();
  const expirationTime = Date.now() + 60 * 60 * 1000; //Expires in 1 hour
  const resetTokenExpiresAt = new Date(expirationTime);
  const storeRandomStringDb = await storeResetToken(
    resetToken,
    userFromDB,
    resetTokenExpiresAt
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  // Function to send the email
  const sendEmail = {
    from: process.env.email,
    to: email,
    subject: "Password Reset Link",
    text: `random string is${resetToken}`,
    html: `<h2>The link for reset your password will expire in 1 hour.<a href='https://merry-licorice-ef956a.netlify.app/reset-password/${resetToken}'>https://merry-licorice-ef956a.netlify.app/reset-password/${resetToken}</a></h2>`,
  };

  transporter.sendMail(sendEmail, (err, info) => {
    if (err) {
      console.log("Error sending email", err);
      res.status(500).json({ error: "Email not sent" });
    } else {
      console.log("Email sent", info.response);
      res.status(200).json({
        message: "Email sent successfully,click that Reset Password Link",
        resetToken,
      });
    }
  });
});

//reset password API
router.post("/reset-password/:token", async (req, res) => {
  const token = req.params.token;
  const { newPassword, confirmPassword } = req.body;

  try {
    let resetToken = await getUserByResetToken(token);

    // Check if the reset token exists in the database
    if (!resetToken) {
      return res.status(404).json({ error: "Invalid reset token" });
    }

    const currentTime = Date.now();
    const resetTokenExpiration = resetToken.resetTokenExpiresAt.getTime();

    // Check if the reset token has expired
    if (currentTime > resetTokenExpiration) {
      return res.status(400).json({ error: "Reset token has expired" });
    }
    //validate required fields
    if (!newPassword) {
      return res.status(400).send({ error: "New Password field is required" });
    }
    //check newPassword pattern
    if (
      !/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[#!@%$_]).{8,}$/g.test(
        newPassword
      )
    ) {
      return res
        .status(400)
        .send({ error: "New password pattern does not match" });
    }
    if (!confirmPassword) {
      return res
        .status(400)
        .send({ error: "Confirm Password field is required " });
    }
    //check confirmPassword pattern
    if (
      !/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[#!@%$_]).{8,}$/g.test(
        confirmPassword
      )
    ) {
      return res
        .status(400)
        .send({ error: "Confirm password pattern does not match" });
    }

    //check newPassword and confirmPassword are same
    if (newPassword !== confirmPassword) {
      return res
        .status(404)
        .json({ error: "New password and confirm password are not same" });
    } else {
      // Update the user's password
      const hashedPassword = await genPassword(newPassword);
      const updatePassword = await updateNewPassword(
        resetToken,
        hashedPassword
      );
      return res.json({ message: "Password reset successful" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export const usersRouter = router;
