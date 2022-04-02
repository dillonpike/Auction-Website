import * as auctions from '../models/auction.server.model';
import * as utility from './utility';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import * as users from "../models/user.server.model";

const read = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("GET auctions");
    try {
        let result = await auctions.getAuctions(req);
        const startIndex = req.query.hasOwnProperty("startIndex") ? parseInt(req.query.startIndex as string, 10) : 0;
        const count = req.query.hasOwnProperty("count") ? parseInt(req.query.count as string, 10) : result.length;
        result = result.slice(startIndex, startIndex + count);
        res.status( 200 ).send({"count": result.length, "auctions": result});
    } catch( err ) {
        res.status( 500 ).send();
    }
}

const create = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented4.");
}

const readOne = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET auction with id ${req.params.id}`);
    try {
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status( 404 ).send();
            return
        }
        const result = await auctions.getAuctionWithID(parseInt(req.params.id, 10));
        if (result.length === 0) {
            res.status( 404 ).send();
        } else {
            res.status( 200 ).send(result[0]);
        }
    } catch( err ) {
        res.status( 500 ).send();
    }
}

const update = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented2.");
}

const remove = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`DELETE auction with id ${req.params.id}`);
    if (!await utility.checkAuthToken(req, res)) {
        return
    }
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
        const auction = await auctions.getAuctionWithID(id);
        if (auction.length === 0) {
            res.status( 404 ).send();
            return
        }
        if (auction[0].sellerId !== await utility.getUserIdFromToken(req, res)) {
            res.status( 403 ).send();
            return
        }
        if ((await auctions.getBidsFromAuction(id)).length > 0) {
            res.status( 403 ).send();
            return
        }
        const result = await auctions.removeAuction(id);
        res.status( 200 ).send();
    } catch( err ) {
        res.status( 500 ).send();
    }
}

const readCategories = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("GET categories");
    try {
        const result = await auctions.getCategories();
        res.status( 200 ).send( await utility.adjustCategoryAttributes(result) );
    } catch( err ) {
        res.status( 500 ).send();
    }
}

const readBids = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET bids from auction with id ${req.params.id}`);
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
        const result = await auctions.getBidsFromAuction(id);
        res.status( 200 ).send(result);
    } catch( err ) {
        res.status( 500 ).send();
    }

}

const placeBid = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented4.");
}

const readImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET image of auction with id: ${req.params.id}`)
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
        const result = await auctions.getFilename( id );
        if (result.length === 0 || result[0].imageFilename === null) {
            res.status( 404 ).send();
        } else {
            if (result[0].imageFilename.endsWith('png')) {
                res.setHeader('content-type', 'image/png');
            } else if (result[0].imageFilename.endsWith('gif')) {
                res.setHeader('content-type', 'image/gif');
            } else {
                res.setHeader('content-type', 'image/jpeg');
            }
            res.status( 200 ).send( await require('mz/fs').readFile(`./storage/images/${result[0].imageFilename}`) );
        }
    } catch( err ) {
        res.status( 500 ).send();
    }
}

const setImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("Not yet implemented4.");
}

export { read, create, readOne, update, remove, readCategories, readBids, placeBid, readImage, setImage }