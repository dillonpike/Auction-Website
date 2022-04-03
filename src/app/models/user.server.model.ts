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
    const query = 'select first_name as firstName, last_name as lastName, email from user where id = ?';
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

const alter = async (id: number, user: User) : Promise<ResultSetHeader> => {
    Logger.info(`Changing user ${id} details`);
    const hash = await hashPassword(user.password);
    const conn = await getPool().getConnection();
    const query = 'update user set first_name = ?, last_name = ?, email = ?, password = ? where id = ?';
    const [ result ] = await conn.query( query, [ user.firstName, user.lastName, user.email, hash, id ] );
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

const checkPassword = async (email: string, password: string) : Promise<boolean> => {
    const conn = await getPool().getConnection();
    const query = 'select password from user where email = ?';
    const [ result ] = await conn.query( query, [ email ] );
    conn.release();
    if (result.length === 0) {
        return false;
    }
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, result[0].password);
}

const addAuthToken = async (email: string) : Promise<User> => {
    Logger.info(`Adding auth token to ${email}`);
    const randToken = require('rand-token');
    const token = randToken.generate(32);
    const conn = await getPool().getConnection();
    let query = 'update user set auth_token = ? where email = ?';
    await conn.query( query, [ token, email ] );
    query = 'select id, auth_token from user where email = ?';
    const [ result ] = await conn.query( query, [ email ] );
    conn.release();
    return result[0];
}

const removeAuthToken = async (token: string) : Promise<void> => {
    Logger.info(`Removing auth token: ${token}`);
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = null where auth_token = ?';
    const [ result ] = await conn.query( query, [ token ] );
    conn.release();
    return
};

const authorise = async (token: string) : Promise<boolean> => {
    Logger.info(`Checking auth token: ${token}`);
    const conn = await getPool().getConnection();
    const query = 'select id from user where auth_token = ?';
    const [ result ] = await conn.query( query, [ token ] );
    conn.release();
    return result.length > 0;
}

const authoriseReturnID = async (token: string) : Promise<User[]> => {
    Logger.info(`Checking auth token: ${token}`);
    const conn = await getPool().getConnection();
    const query = 'select id from user where auth_token = ?';
    const [ result ] = await conn.query( query, [ token ] )
    conn.release();
    return result;
}

const getFilename = async (id: number) : Promise<User[]> => {
    Logger.info(`Getting image filename of user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select image_filename from user where id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
}

const setFilename = async (id: number, filename: string) : Promise<ResultSetHeader> => {
    Logger.info(`Setting user ${id}'s filename to ${filename}`);
    const conn = await getPool().getConnection();
    const query = 'update user set image_filename = ? where id = ?';
    const [ result ] = await conn.query( query, [ filename, id ] );
    conn.release();
    return result;
}

export { getAll, getOne, getEmails, insert, alter, remove, checkPassword, addAuthToken, removeAuthToken, authorise,
    authoriseReturnID, getFilename, setFilename }