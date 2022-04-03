import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import {Request} from "express";
import {isArray} from "util";

const getAuctionWithID = async (id: number) : Promise<Auction[]> =>  {
    Logger.info(`Getting auction ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select auction.id as auctionId, title, category_id as categoryId, seller_id as sellerId, ' +
        'first_name as sellerFirstName, last_name as sellerLastName, reserve, count(*) as numBids, ' +
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


const getAuctions = async (req: Request) : Promise<Auction[]> => {
    Logger.info(`Getting all auctions from the database`);
    const conn = await getPool().getConnection();
    const queryVariables: any[] = [];
    let query = 'select auction.id as auctionId, title, category_id as categoryId, seller_id as sellerId, ' +
        'first_name as sellerFirstName, last_name as sellerLastName, reserve, count(*) as numBids, ' +
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
    const sorts = {'ALPHABETICAL_ASC': 'title asc', 'ALPHABETICAL_DESC': 'title desc', 'CLOSING_SOON': 'end_date asc',
        'CLOSING_LAST': 'end date desc', 'BIDS_ASC': 'max(amount) asc', 'BIDS_DESC': 'max(amount) desc',
        'RESERVE_ASC': 'reserve asc', 'RESERVE_DESC': 'reserve desc'
    }
    // @ts-ignore
    query += sorts[req.query.sortBy] !== undefined ? sorts[req.query.sortBy] : sorts.CLOSING_SOON;
    const [ rows ] = await conn.query( query, queryVariables );
    conn.release();
    return rows;
};

const removeAuction = async (id: number) : Promise<ResultSetHeader> =>  {
    Logger.info(`Removing auction ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'delete from auction where auction_id = ?'
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    Logger.info(result);
    return result;
}

const getBidsFromAuction = async (id: number) : Promise<Bid[]> => {
    Logger.info(`Getting bids from auction ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select user_id as bidderId, amount, first_name as firstName, last_name as lastName, timestamp ' +
        'from auction_bid, user where user_id = user.id and auction_id = ? order by amount desc';
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    Logger.info(result);
    return result;
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

export { getAuctionWithID, getAuctions, removeAuction, getBidsFromAuction, getCategories, placeBid, getFilename,
    setFilename }