import * as users from '../models/user.server.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import * as utility from "./utility";

const createUserSchema = {
    type: "object",
    properties: {
        firstName: {type: "string", minLength: 1},
        lastName: {type: "string", minLength: 1},
        email: {type: "string", minLength: 1},
        password: {type: "string", minLength: 1},
    },
    required: ["firstName", "lastName", "email", "password"],
    additionalProperties: true
}

const updateUserSchema = {
    type: "object",
    properties: {
        firstName: {type: "string", minLength: 1},
        lastName: {type: "string", minLength: 1},
        email: {type: "string", minLength: 1},
        password: {type: "string", minLength: 1},
        currentPassword: {type: "string", minLength: 1},
    },
    additionalProperties: true
}

const create = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST create a user with email: ${req.body.email}`)
    if (!await checkProperties(req, res, ["firstName", "lastName", "email", "password"])) {
        res.status(400).send();
        return
    }
    if (!await utility.checkPropertiesAJV(req.body, createUserSchema)) {
        res.status( 400 ).send();
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
            res.status(400).send();
            return
        }
        const result = await users.insert( firstName, lastName, email, password );
        res.status( 201 ).send({"userId": result.insertId} );
    } catch( err ) {
        res.status( 500 ).send( `ERROR creating user ${email}: ${ err }` );
    }
};

const read = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET single user with id: ${req.params.id}`)
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
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
    Logger.http(`PATCH update user with id: ${req.params.id}`)
    if (!await checkAuthToken(req, res)) {
        return
    }
    if (!await checkProperties(req, res, ["firstName"]) && !await checkProperties(req, res, ["lastName"]) &&
        !await checkProperties(req, res, ["email"]) && !await checkProperties(req, res, ["password"])) {
        res.status(400).send();
        return
    }
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
        const result = await users.getOne( id );
        if (result.length === 0) {
            res.status(404).send();
            return
        }
        if (await getUserIdFromToken(req, res) !== id) {
            res.status(403).send();
            return
        }
        if (!await utility.checkPropertiesAJV(req.body, updateUserSchema)) {
            res.status( 400 ).send();
            return
        }
        if (await checkProperties(req, res, ["email"]) && (!req.body.email.includes("@") ||
                ((await users.getEmails()).includes(req.body.email) && req.body.email !== result[0].email)) ||
            await checkProperties(req, res, ["password"]) && (req.body.password.length < 1 ||
                !await checkProperties(req, res, ["currentPassword"]))) {
            Logger.http("Invalid password or email.");
            res.status(400).send();
            return
        }
        result[0].firstName = await checkProperties(req, res, ["firstName"]) ? req.body.firstName : result[0].firstName;
        result[0].lastName = await checkProperties(req, res, ["lastName"]) ? req.body.lastName : result[0].lastName;
        result[0].password = await checkProperties(req, res, ["password"]) ? req.body.password : result[0].password;
        if (await checkProperties(req, res, ["currentPassword"]) && !await users.checkPassword(result[0].email, req.body.currentPassword)) {
            Logger.http("Incorrect password");
            res.status(400).send();
            return
        }
        await users.alter( id, result[0] );
        res.status( 200 ).send();
    } catch( err ) {
        res.status( 500 ).send();
    }
};

const login = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST user: ${req.body.email} log in`)
    if (!await checkProperties(req, res, ["email", "password"])) {
        res.status(400).send();
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
        res.status( 500 ).send();
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
            return false;
        }
    }
    return true;
}

const readImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET image of user with id: ${req.params.id}`)
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
        const result = await users.getFilename( id );
        if (result.length === 0 || result[0].image_filename === null) {
            res.status( 404 ).send();
        } else {
            if (result[0].image_filename.endsWith('png')) {
                res.setHeader('content-type', 'image/png');
            } else if (result[0].image_filename.endsWith('gif')) {
                res.setHeader('content-type', 'image/gif');
            } else {
                res.setHeader('content-type', 'image/jpeg');
            }
            res.status( 200 ).send( await require('mz/fs').readFile(`./storage/images/${result[0].image_filename}`) );
        }
    } catch( err ) {
        res.status( 500 ).send();
    }
}

const setImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`PUT update image of user with id: ${req.params.id}`)
    if (!await checkAuthToken(req, res)) {
        return
    }
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
        const result = await users.getOne(id);
        if (result.length === 0) {
            res.status(404).send();
            return
        }
        if (await getUserIdFromToken(req, res) !== id) {
            res.status(403).send();
            return
        }
        if (!await checkContentType(req)) {
            res.status(400).send();
            return
        }
        const filename = await createFileName(req);
        await writeFile(req, filename);
        const oldFilename = await users.getFilename(id);
        await users.setFilename(id, filename);
        if (oldFilename != null && await require('mz/fs').exists(`./storage/images/${oldFilename[0].image_filename}`)) {
            Logger.info(`Removing old image from user ${id}`)
            await require('mz/fs').unlink(`./storage/images/${oldFilename[0].image_filename}`);
            res.status(200).send();
        } else {
            res.status(201).send();
        }
    } catch( err ) {
        res.status( 500 ).send();
    }
}

const removeImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`DELETE remove image of user with id: ${req.params.id}`)
    if (!await checkAuthToken(req, res)) {
        return
    }
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
        const userResult = await users.getOne(id);
        const filenameResult = await users.getFilename( parseInt(req.params.id, 10) );
        if (userResult.length === 0 || filenameResult[0].image_filename === null) {
            res.status(404).send();
            return
        }
        if (await getUserIdFromToken(req, res) !== id) {
            res.status(403).send();
            return
        }
        await require('mz/fs').unlink(`./storage/images/${filenameResult[0].image_filename}`);
        const result = await users.setFilename( id, null );
        res.status(200).send();
    } catch( err ) {
        res.status( 500 ).send();
    }
}

const checkAuthToken = async (req: Request, res: Response) : Promise<boolean> => {
    if (req.headers.hasOwnProperty("x-authorization") && req.headers["x-authorization"].toString() !== 'null') {
        try {
            const authorised = await users.authorise(req.headers["x-authorization"].toString());
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
            Logger.info(`Token has id: ${result[0].id}`);
            return result[0].id;
        }
    }
    return -1;
}

const checkContentType = async (req: Request) : Promise<boolean> => {
    return (req.headers.hasOwnProperty("content-type") &&
        ["image/jpeg", "image/png", "image/gif"].includes(req.headers["content-type"]));
}

const writeFile = async (req: Request, filename: string) : Promise<void> => {
    req.pipe(require('mz/fs').createWriteStream(`./storage/images/${filename}`));
}

const createFileName = async (req: Request) : Promise<string> => {
    return require('rand-token').generate(32) + "." +
        req.headers["content-type"].slice(req.headers["content-type"].indexOf("/") + 1);
}

export { create, read, update, login, logout, readImage, setImage, removeImage }