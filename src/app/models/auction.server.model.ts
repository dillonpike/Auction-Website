import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import {Request} from "express";
import {isArray} from "util";
import * as utility from '../controllers/utility';

const getAuctionWithID = async (id: number) : Promise<Auction[]> =>  {
    Logger.info(`Getting auction ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select auction.id as auctionId, title, category_id as categoryId, seller_id as sellerId, ' +
        'first_name as sellerFirstName, last_name as sellerLastName, reserve, count(amount) as numBids, ' +
        'max(amount) as highestBid, end_date as endDate, description ' +
        'from auction ' +
        'join user on seller_id = user.id ' +
        'left outer join auction_bid on auction_id = auction.id ' +
        'where auction.id = ? ' +
        'having auction.id = ?';
    const [ rows ] = await conn.query( query, [ id, id ] );
    conn.release();
    return rows;
}

const getAuctionWithTitle = async (title: string, sellerId: number) : Promise<Auction[]> =>  {
    Logger.info(`Getting auction ${title} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select auction.id as auctionId, title, seller_id as sellerId from auction where title = ? and seller_id = ?';
    const [ rows ] = await conn.query( query, [ title, sellerId ] );
    conn.release();
    Logger.info(rows);
    return rows;
}


const getAuctions = async (req: Request) : Promise<Auction[]> => {
    Logger.info(`Getting all auctions from the database`);
    const conn = await getPool().getConnection();
    const queryVariables: any[] = [];
    let query = 'select auction.id as auctionId, title, category_id as categoryId, seller_id as sellerId, ' +
        'first_name as sellerFirstName, last_name as sellerLastName, reserve, count(amount) as numBids, ' +
        'max(amount) as highestBid, end_date as endDate ' +
        'from auction ' +
        'left outer join user on seller_id = user.id ' +
        'left outer join auction_bid on auction_id = auction.id ' +
        'where 1=1';
    if (req.query.q !== undefined) {
        query += ` and title like '%${conn.escape(req.query.q).slice(1, -1)}%'`;
    }
    if (req.query.categoryIds !== undefined) {
        const categoryIds = isArray(req.query.categoryIds) ?
            req.query.categoryIds.map(id => parseInt(id as string, 10)) : req.query.categoryIds;
        query += ' and category_id in (?)'
        queryVariables.push(categoryIds)
    }
    if (req.query.sellerId !== undefined) {
        query += ' and seller_id = ?'
        queryVariables.push(parseInt(req.query.sellerId as string, 10))
    }
    if (req.query.bidderId !== undefined) {
        query += ' and auction.id in (select auction.id from auction, auction_bid where auction.id = auction_id and ' +
            'user_id = ? group by auction.id)';
        queryVariables.push(parseInt(req.query.bidderId as string, 10))
    }
    query += ' group by auction.id order by ';
    // @ts-ignore
    query += utility.sorts[req.query.sortBy] !== undefined ? utility.sorts[req.query.sortBy] : utility.sorts.CLOSING_SOON;
    const [ rows ] = await conn.query( query, queryVariables );
    conn.release();
    return rows;
};

const addAuction = async (title: string, description: string, endDate: string, reserve: number, sellerId: number, categoryId: number) : Promise<ResultSetHeader> =>  {
    Logger.info(`Adding auction for ${title} to the database`);
    const conn = await getPool().getConnection();
    const query = 'insert into auction (title, description, end_date, image_filename, reserve, seller_id, category_id) values ( ?, ?, ?, ?, ?, ?, ? ) '
    const [ result ] = await conn.query( query, [ title, description, endDate, null, reserve, sellerId, categoryId ] );
    conn.release();
    return result;
}

const alterAuction = async (req: Request) : Promise<ResultSetHeader> => {
    Logger.info(`Altering auction ${req.params.id}`);
    const conn = await getPool().getConnection();
    const queryVariables: any[] = [];
    let query = 'update auction set ';
    if (req.body.title !== undefined) {
        query += 'title = ?, ';
        queryVariables.push(req.body.title);
    }
    if (req.body.description !== undefined) {
        query += 'description = ?, ';
        queryVariables.push(req.body.description);
    }
    if (req.body.endDate !== undefined) {
        query += 'end_date = ?, ';
        queryVariables.push(req.body.endDate);
    }
    if (req.body.reserve !== undefined) {
        query += 'reserve = ?, ';
        queryVariables.push(parseInt(req.body.reserve, 10));
    }
    if (req.body.categoryId !== undefined) {
        query += 'category_id = ?, ';
        queryVariables.push(parseInt(req.body.categoryId, 10));
    }
    query = query.slice(0, query.length - 2) + ' where id = ?';
    queryVariables.push(parseInt(req.params.id, 10));
    const [ result ] = await conn.query( query, queryVariables );
    conn.release();
    return result;
}

const removeAuction = async (id: number) : Promise<ResultSetHeader> =>  {
    Logger.info(`Removing auction ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'delete from auction where id = ?'
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    return result;
}

const getBidsFromAuction = async (id: number) : Promise<Bid[]> => {
    Logger.info(`Getting bids from auction ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select user_id as bidderId, amount, first_name as firstName, last_name as lastName, timestamp ' +
        'from auction_bid, user where user_id = user.id and auction_id = ? order by amount desc';
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    return result;
}

const getCategoryWithID = async (id: number) : Promise<Category[]> => {
    Logger.info(`Getting category ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from category where id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
}

const getCategories = async () : Promise<Category[]> => {
    Logger.info(`Getting all categories from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from category';
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows;
};

const placeBid = async (auctionId: number, userId: number, amount: number) : Promise<ResultSetHeader> => {
    Logger.info(`Placing a bid of ${amount} on auction ${auctionId} by user ${userId}`);
    const conn = await getPool().getConnection();
    const query = 'insert into auction_bid (auction_id, user_id, amount, timestamp) values ( ?, ?, ?, ? )';
    const [ result ] = await conn.query( query, [auctionId, userId, amount, new Date()] );
    conn.release();
    return result;
}

const getFilename = async(id: number) : Promise<Auction[]> => {
    Logger.info(`Getting image filename of auction ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select image_filename as imageFilename from auction where id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
}

const setFilename = async (id: number, filename: string) : Promise<ResultSetHeader> => {
    Logger.info(`Setting auction ${id}'s filename to ${filename}`);
    const conn = await getPool().getConnection();
    const query = 'update auction set image_filename = ? where id = ?';
    const [ result ] = await conn.query( query, [ filename, id ] );
    conn.release();
    return result;
}

export { getAuctionWithID, getAuctionWithTitle, getAuctions, addAuction, alterAuction, removeAuction,
    getBidsFromAuction, getCategoryWithID, getCategories, placeBid, getFilename, setFilename }