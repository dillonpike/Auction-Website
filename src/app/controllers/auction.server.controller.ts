import * as auctions from '../models/auction.server.model';
import * as utility from './utility';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import fs from "mz/fs";
import Ajv, {JSONSchemaType} from "ajv";
import {isArray} from "util";
const ajv = new Ajv();


const getAuctionsSchema = {
    type: "object",
    properties: {
        startIndex: {type: "integer"},
        count: {type: "integer"},
        q: {type: "string"},
        sellerId: {type: "integer"},
        bidderId: {type: "integer"},
        sortBy: {type: "string"}
    },
    additionalProperties: true
}

const createAuctionSchema = {
    type: "object",
    properties: {
        title: {type: "string"},
        description: {type: "string"},
        categoryId: {type: "integer"},
        endDate: {type: "string"},
        reserve: {type: "integer"}
    },
    required: ["title", "description", "categoryId", "endDate"],
    additionalProperties: true
}

const updateAuctionSchema = {
    type: "object",
    properties: {
        title: {type: "string"},
        description: {type: "string"},
        categoryId: {type: "integer"},
        endDate: {type: "string"},
        reserve: {type: "integer"}
    },
    anyOf: [{"required": ["title"]}, {"required": ["description"]}, {"required": ["categoryId"]},
        {"required": ["endDate"]}, {"required": ["reserve"]}],
    additionalProperties: true
}

const read = async (req: Request, res: Response) : Promise<void> => {
    Logger.http("GET auctions");
    if (!await utility.checkPropertiesAJV(req.query, getAuctionsSchema)) {
        res.status( 400 ).send();
        return
    }
    try {
        // @ts-ignore
        Logger.info((req.query.sortBy !== undefined && utility.sorts[req.query.sortBy as string] === undefined))
        Logger.info((req.query.bidderId !== undefined && parseInt(req.query.bidderId.toString(), 10)))
        Logger.info((req.query.sellerId !== undefined && parseInt(req.query.sellerId.toString(), 10) < 0))
        Logger.info((req.query.count !== undefined && parseInt(req.query.count.toString(), 10) < 0) )
        // @ts-ignore
        if ((req.query.sortBy !== undefined && utility.sorts[req.query.sortBy as string] === undefined) ||
            (req.query.sellerId !== undefined && parseInt(req.query.sellerId.toString(), 10) < 0) ||
            (req.query.count !== undefined && parseInt(req.query.count.toString(), 10) < 0) ||
            (req.query.bidderId !== undefined && parseInt(req.query.bidderId.toString(), 10) < 0) ||
            (req.query.startIndex !== undefined && parseInt(req.query.startIndex.toString(), 10) < 0) ||
            (req.query.q !== undefined && req.query.q.length === 0)
        ) {
            res.status( 400 ).send();
            return
        }
        if (req.query.categoryIds !== undefined) {
            const categoryIds = isArray(req.query.categoryIds) ?
                req.query.categoryIds.map(id => parseInt(id as string, 10)) :
                [ parseInt(req.query.categoryIds as string, 10) ];
            for (const categoryId of categoryIds) {
                if (isNaN(categoryId) || (await auctions.getCategoryWithID(categoryId)).length === 0) {
                    res.status( 400 ).send();
                    return
                }
            }
        }
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
    Logger.http(`POST auction with title ${req.body.title}`);
    if (!await utility.checkAuthToken(req, res)) {
        return
    }
    if (!await utility.checkPropertiesAJV(req.body, createAuctionSchema)) {
        res.status( 400 ).send();
        return
    }
    try {
        if (req.body.endDate <= new Date()) {
            res.status( 400 ).send();
            return
        }
        const sellerId = await utility.getUserIdFromToken(req, res);
        const auction = await auctions.getAuctionWithTitle(req.body.title, sellerId);
        if (auction.length > 0) {
            res.status( 403 ).send();
            return
        }
        const reserve = req.body.hasOwnProperty("reserve") ? parseInt(req.body.reserve, 10) : 1;
        const result = await auctions.addAuction(req.body.title, req.body.description, req.body.endDate, reserve,
            sellerId, parseInt(req.body.categoryId, 10));
        res.status( 200 ).send( {"auctionId": result.insertId} )
    } catch( err ) {
        res.status( 500 ).send();
    }
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
    Logger.http(`PATCH update auction with id ${req.params.id}`);
    if (!await utility.checkAuthToken(req, res)) {
        return
    }
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status( 404 ).send();
            return
        }
        if (!await utility.checkPropertiesAJV(req.body, updateAuctionSchema) ||
            (req.body.categoryId !== undefined && (await auctions.getCategoryWithID(req.body.categoryId)).length === 0) ||
            (req.body.reserve !== undefined && parseInt(req.body.reserve, 10) < 1) ||
            (req.body.title !== undefined && req.body.title.length === 0)) {
            res.status( 400 ).send();
            return
        }
        const result = await auctions.getAuctionWithID(id);
        if (result.length === 0) {
            res.status( 404 ).send();
            return
        }
        if ((await auctions.getBidsFromAuction(id)).length > 0) {
            res.status( 403 ).send();
            return
        }
        const updateResult = await auctions.alterAuction(req);
        res.status( 200 ).send()
    } catch( err ) {
        res.status( 500 ).send();
    }
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
    Logger.http(`POST place bid on auction with id ${req.params.id}`);
    if (!await utility.checkAuthToken(req, res)) {
        return
    }
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(404).send();
            return
        }
        if (!await utility.checkProperties(req, res, ["amount"])) {
            res.status(400).send();
            return
        }
        const auction = await auctions.getAuctionWithID(id);
        if (auction.length === 0) {
            res.status( 404 ).send();
            return
        }
        const userId = await utility.getUserIdFromToken(req, res);
        if (req.body.amount <= auction[0].highestBid || auction[0].sellerId === userId) {
            res.status( 403 ).send();
            return
        }
        await auctions.placeBid(id, userId, req.body.amount);
        res.status( 201 ).send()
    } catch( err ) {
        res.status( 500 ).send();
    }
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
    Logger.http(`PUT update image of auction with id: ${req.params.id}`)
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
        if (await utility.getUserIdFromToken(req, res) !== auction[0].sellerId) {
            res.status(403).send();
            return
        }
        if (!await utility.checkContentType(req)) {
            res.status(400).send();
            return
        }
        const filename = await utility.createFileName(req);
        await utility.writeFile(req, filename);
        const oldFilename = await auctions.getFilename(id);
        await auctions.setFilename(id, filename);
        if (oldFilename != null && await fs.exists(`./storage/images/${oldFilename[0].imageFilename}`)) {
            Logger.info(`Removing old image from auction ${id}`)
            await fs.unlink(`./storage/images/${oldFilename[0].imageFilename}`);
            res.status(200).send();
        } else {
            res.status(201).send();
        }
        res.status(201).send();
    } catch( err ) {
        res.status( 500 ).send();
    }
}

export { read, create, readOne, update, remove, readCategories, readBids, placeBid, readImage, setImage }