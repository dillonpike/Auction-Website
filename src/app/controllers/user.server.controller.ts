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
    try {
        if ((await users.getEmails()).includes(email)) {
            res.status(403).send();
            return
        }
        const result = await users.insert( firstName, lastName, email, password );
        res.status( 201 ).send({"userId": result.insertId} );
    } catch( err ) {
        res.status( 500 ).send( `ERROR creating user ${email}: ${ err }` );
    }
};

const read = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET single user id: ${req.params.id}`)
    try {
        const id = parseInt (req.params.id, 10)
        const result = await users.getOne( id );
        if (result.length === 0) {
            res.status( 404 ).send();
        } else {
            if (await getUserIdFromToken(req, res) !== id) {
                delete result[0].email;
            }
            res.status( 200 ).send( result[0] );
        }
    } catch( err ) {
        res.status( 500 ).send();
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
    Logger.http(`POST log out with token: ${req.headers["x-authorisation"]}`)
    if (!await checkAuthToken(req, res)) {
        return
    }
    try {
        const result = await users.removeAuthToken( req.headers["x-authorization"].toString() );
        res.status( 200 ).send();
    } catch( err ) {
        res.status( 500 ).send();
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

const checkAuthToken = async (req: Request, res: Response) : Promise<boolean> => {
    if (req.headers.hasOwnProperty("x-authorization") && req.headers["x-authorization"].toString() !== 'null') {
        try {
            const authorised = users.authorise(req.headers["x-authorization"].toString());
            if (authorised) {
                return true;
            }
        } catch {
            res.status( 500 ).send();
            return false;
        }
    }
    res.status(401).send();
    return false;
}

const getUserIdFromToken = async (req: Request, res: Response) : Promise<number> => {
    if (req.headers.hasOwnProperty("x-authorization") && req.headers["x-authorization"].toString() !== 'null') {
        const result = await users.authoriseReturnID(req.headers["x-authorization"].toString());
        if (result.length > 0) {
            return result[0].id;
        }
    }
    return -1;
}

export { create, read, update, remove, login, logout }