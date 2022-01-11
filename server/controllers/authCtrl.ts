import { Request, Response } from 'express'
import User from '../models/userModel';
import bcrypt from 'bcrypt';
import { generateActiveToken, generateAccessToken, generateRefreshToken } from '../config/generateToken';
import sendMail from '../config/sendMail'
import { validateEmail, validatePhone } from '../middleware/valid';
import { sendSms } from '../config/sendSMS';
import jwt from 'jsonwebtoken'
import { IDecodedToken, IUser } from '../config/interface'

const CLIENT_URL = `${process.env.BASE_URL}`

const authCtrl = {
    register: async (req: Request, res: Response) => {
        try {
            const { name, account, password } = req.body;
            const user = await User.findOne({ account });
            if (user) {
                return res.status(500).json({ msg: 'Email or Phone allready exists.' })
            }
            const passwordHash = await bcrypt.hash(password, 12);

            const newUser = {
                name, account, password: passwordHash
            }

            const active_token = generateActiveToken({ newUser });

            const url = `${CLIENT_URL}/active/${active_token}`

            if (validateEmail(account)) {
                sendMail(account, url, "Verify your email address")
                return res.json({ msg: "Success! Please check your email.", active_token })
            } else if (validatePhone(account)) {
                sendSms(account, url, "Verify your phone number")
                return res.json({ msg: "Success! Please check phone." })
            }
            res.json({ msg: active_token })
        } catch (err: any) {
            return res.status(500).json({ msg: err.message })
        }
    },

    activeAccount: async (req: Request, res: Response) => {
        try {
            const { active_token } = req.body;
            const decode = <IDecodedToken>jwt.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`)

            const { newUser } = decode

            if (!newUser) return res.status(400).json({ msg: "Invalid authentication." })

            const user = new User(newUser)

            await user.save()

            res.json({ msg: "Account has been activated!" })

        } catch (error: any) {
            return res.status(500).json({ msg: error })
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { account, password } = req.body;

            const user = await User.findOne({ account });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid credential' });
            }

            loginUser(user, password, res);

        } catch (err: any) {
            return res.status(500).json({ msg: err.message })
        }
    },

    logout: async (req: Request, res: Response) => {
        try {
            res.clearCookie('refereshtoken', { path: `api/referesh_token` })
            return res.json({
                msg: "Logout success"
            })
        } catch (err: any) {
            return res.status(500).json({ msg: err.message })
        }
    },

    refereshToken: async (req: Request, res: Response) => {
        try {
            const rf_token = req.cookies.refereshtoken;

            if (!rf_token) return res.status(500).json({ msg: "Please login now!" });

            const decode = <IDecodedToken>jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`);

            if (!decode.id) return res.status(500).json({ msg: "Please login now!" });

            const user = await User.findById(decode.id).select("-password");

            if (!user) return res.status(400).json({ msg: "This user does not exist" });

            const access_token = generateAccessToken({ id: user._id });

            res.json({
                access_token
            })
        } catch (err: any) {
            return res.status(500).json({ msg: err.message })
        }
    }
}

const loginUser = async (user: IUser, password: string, res: Response) => {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(500).json({ msg: "Invalid credential" })

    const access_token = generateAccessToken({ id: user._id });
    const referesh_token = generateRefreshToken({ id: user._id });

    res.cookie('refereshtoken', referesh_token, {
        httpOnly: true,
        path: `api/referesh_token`,
        maxAge: 30 * 24 * 60 * 60 * 1000
    })

    res.json({
        msg: "Login Success",
        access_token,
        user: { ...user._doc, password: '' }
    })
}

export default authCtrl