import { Request, Response, NextFunction } from 'express'

export const validRegister = async (req: Request, res: Response, next: NextFunction) => {
    const { name, account, password } = req.body;

    const errors = [];

    if (!name) {
        errors.push("Please add your name.")
    } else if (name.length > 20) {
        errors.push("Your name is up to 20 chars long.")
    }

    if (!account) {
        errors.push("Please add your email or phone number.")
    } else if (!validatePhone(account) && !validateEmail(account)) {
        errors.push("Email or phone number format is incorrect.")
    }

    if (password.length < 6) {
        errors.push("Password must be at least 6 chars.")
    }

    if (errors.length > 0) return res.status(400).json({ msg: errors })

    next();
}

export const validatePhone = (phone: string) => {
    const re = /^[+]/g;
    return re.test(String(phone))
}

export const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase())
};