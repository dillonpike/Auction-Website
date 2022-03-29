import * as users from '../models/auction.server.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";

const read = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented.");
}

const create = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented.");
}

const readOne = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented.");
}

const update = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented.");
}

const remove = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented.");
}

const readCategories = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented.");
}

export { read, create, readOne, update, remove, readCategories }