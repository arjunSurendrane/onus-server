import User from "../models/userModel.js";
import { updateUser, Users } from "../services/User.js";

export const BlockUser = async (req, res) => {
  try {
    const email = req.body.email;
    const value = req.body.value;
    const blockedUser = await updateUser(email, { block: value });
    res.status(205).json({ status: "success", blockedUser });
  } catch (error) {
    res.status(404).json({ status: "error" });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const allUser = await Users();
    res.status(200).json({ status: "success", users: allUser });
  } catch (error) {
    res.status(404).json({ status: "error", error });
  }
};
