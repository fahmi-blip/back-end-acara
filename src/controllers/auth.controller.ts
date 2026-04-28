import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";

type Tregister = {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Tlogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullname: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

export default {
  async register(req: Request, res: Response) {
    const { fullname, username, email, password, confirmPassword } =
      req.body as unknown as Tregister;
    try {
      await registerValidateSchema.validate({
        fullname,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName: fullname,
        userName: username,
        email,
        password,
      });

      res.status(200).json({ message: "Register successful", data: result });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },
  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body as unknown as Tlogin;
      //ambil data user berdasarkan identifier (username atau email)
      const userByIdentifier = await UserModel.findOne({
        $or: [{ email: identifier }, { userName: identifier }] ,
      });

      if (!userByIdentifier) {
        return res.status(400).json({ message: "User not found", data: null });
      }
      //validasi password
      const validatedPassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatedPassword) {
        return res.status(403).json({
          message: "User not found",
          data: null,
        });
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      res.status(200).json({ message: "Login successful", data: token });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },

    async me(req: IReqUser, res: Response) {
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            res.status(200).json({ message: "Success get user", data: result});
        }catch (error) {
          const err = error as unknown as Error;
          res.status(400).json({ message: err.message, data: null });
        }
    },
};
