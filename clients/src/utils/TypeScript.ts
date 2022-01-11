import { ChangeEvent, FormEvent } from "react";

export type InputChange = ChangeEvent<HTMLInputElement>

export type FormSubmit = FormEvent<HTMLFormElement>

export interface IParams {
    page: string
    slug: string
}

export interface IUserLogin {
    account: string
    password: string
}

export interface IUser extends IUserLogin {
    account: string
    avatar: string
    createdAt: string
    name: string
    password: string
    role: string
    type: string
    updatedAt: string
    __v: 0
    _id: string
}