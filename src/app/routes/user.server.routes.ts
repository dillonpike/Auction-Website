import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as users from '../controllers/user.server.controller';

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/users/register' )
        .post( users.create );
    app.route( rootUrl + '/users/login' )
        .post( users.login );
    app.route( rootUrl + '/users/logout')
        .post( users.logout );
    app.route( rootUrl + '/users/:id')
        .get( users.read )
        .patch( users.update );
    app.route( rootUrl + '/users/:id/image')
        .get( users.readImage )
        .put( users.setImage )
        .put( users.removeImage );
};
