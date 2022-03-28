import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as auctions from '../controllers/auction.server.controller';

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/auctions' )
        .get( auctions.read )
        .post( auctions.create );
    app.route( rootUrl + '/auctions/:id' )
        .get( auctions.readOne )
        .patch( auctions.update )
        .delete( auctions.remove );
    app.route( rootUrl + '/auctions/categories')
        .get ( auctions.readCategories );
};
