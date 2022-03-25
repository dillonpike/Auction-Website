import * as users from '../models/user.server.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";

const create = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST create a user with email: ${req.body.email}`)
    if (await checkProperties(req, res, ["firstName", "lastName", "email", "password"])) {
        return
    }
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    if (!email.includes("@") || password.length < 1) {
        res.status(400).send();
        return
    }
    if ((await users.getEmails()).includes(email)) {
        res.status(403).send();
        return
    }
    try {
        const result = await users.insert( firstName, lastName, email, password );
        res.status( 201 ).send({"userId": result.insertId} );
    } catch( err ) {
        res.status( 500 ).send( `ERROR creating user ${email}: ${ err }` );
    }
};

const read = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET single user id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await users.getOne( parseInt(id, 10) );
        if( result.length === 0 ){
            res.status( 404 ).send('User not found');
        } else {
            res.status( 200 ).send( result[0] );
        }
    } catch( err ) {
        res.status( 500 ).send( `ERROR reading user ${id}: ${ err }`);
    }
};

const update = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST id: ${req.params.id}, update username: ${req.body.username}`)
    if (! req.body.hasOwnProperty("username")){
        res.status(400).send("Please provide username field");
        return
    }
    const id = req.params.id;
    const username = req.body.username;
    try {
        const result = await users.alter( parseInt(id, 10), username );
        res.status( 200 ).send({"user_id": parseInt(id, 10), "username": username} );
    } catch( err ) {
        res.status( 500 ).send( `ERROR updating user ${id}: ${ err }` );
    }
};

const remove = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`DELETE id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await users.remove( parseInt(id, 10) );
        res.status( 200 ).send( result );
    } catch( err ) {
        res.status( 500 ).send( `ERROR deleting user ${id}: ${ err }` );
    }
};

const login = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST user: ${req.body.email} log in`)
    if (await checkProperties(req, res, ["email", "password"])) {
        return
    }
    const email = req.body.email;
    const password = req.body.password;
    if (!await users.checkPassword(email, password)) {
        res.status(400).send();
        return
    }
    try {
        const result = await users.addAuthToken( email );
        res.status( 200 ).send({"userId": result.id, "token": result.auth_token} );
    } catch( err ) {
        res.status( 500 ).send( `ERROR creating user ${email}: ${ err }` );
    }
};

const logout = async (req: Request, res: Response) : Promise<void> => {
    if (await checkProperties(req, res, ["email", "password"])) {
        return
    }
};

const checkProperties = async (req: Request, res: Response, properties: string[]) : Promise<boolean> => {
    for (const property of properties) {
        if (!req.body.hasOwnProperty(property)) {
            res.status(400).send();
            return true;
        }
    }
    return false;
}

export { create, read, update, remove, login, logout }