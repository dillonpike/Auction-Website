import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";


const getAll = async () : Promise<User[]> => {
    Logger.info(`Getting all users from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user';
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows;
};

const getOne = async (id: number) : Promise<User[]> => {
    Logger.info(`Getting user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user where user_id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
};

const getEmails = async() : Promise<string[]> => {
    Logger.info(`Getting all emails from the database`);
    const conn = await getPool().getConnection();
    const query = 'select email from user';
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows.map((element: { email: string; }) => element.email);
}

const insert = async (firstName: string, lastName: string, email: string, password: string) : Promise<ResultSetHeader> => {
    Logger.info(`Adding user ${email} to the database`);
    const conn = await getPool().getConnection();
    const hash = await hashPassword(password);
    const query = 'insert into user (email, first_name, last_name, image_filename, password, auth_token) values ( ?, ?, ?, ?, ?, ? )';
    const [ result ] = await conn.query( query, [ email, firstName, lastName, null, hash, null ] );
    conn.release();
    return result;
};

const alter = async (id: number, newUsername: string) : Promise<ResultSetHeader> => {
    Logger.info(`Changing user ${id} to ${newUsername}`);
    const conn = await getPool().getConnection();
    const query = 'update user set username = ? where user_id = ?';
    const [ result ] = await conn.query( query, [ newUsername, id ] );
    conn.release();
    return result;
};

const remove = async (id: number) : Promise<ResultSetHeader> => {
    Logger.info(`Deleting user ${id}`);
    const conn = await getPool().getConnection();
    const query = 'delete from user where user_id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    return result;
};

const hashPassword = async (password: string) : Promise<string> => {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
};

export { getAll, getOne, getEmails, insert, alter, remove }