import Logger from "../../config/logger";
import {Request, Response} from "express";
import * as users from "../models/user.server.model";

const adjustCategoryAttributes = async (categories: Category[]) => {
    Logger.info("Adjusting category attributes")
    const adjusted = [];
    for (const category of categories) {
        const categoryJSON = {categoryId: category.id, name: category.name}
        adjusted.push(categoryJSON);
    }
    return adjusted;
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

export { adjustCategoryAttributes, checkAuthToken, getUserIdFromToken, checkContentType, writeFile, createFileName }