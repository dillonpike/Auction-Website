import {TextField, Paper, Toolbar, Button} from "@mui/material";
import CSS from 'csstype';
import axios from "axios";
import React from "react";
import AuctionListObject from "./AuctionListObject";

const SearchBar = () => {

    const [auctions, setAuctions] = React.useState([])
    const [searchTitle, setSearchTitle] = React.useState("")

    const updateSearchTitleState = (event: any) => {
        setSearchTitle(event.target.value)
    }

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
    }

    const getAuctions = () => {
        axios.get('http://localhost:4941/api/v1/auctions', { params: { q: searchTitle } })
            .then((response) => {
                setAuctions(response.data.auctions)
                // setErrorFlag(false)
                // setErrorMessage("")
            }, (error) => {
                // setErrorFlag(true)
                // setErrorMessage(error.toString())
            })
    }

    const auction_rows = () => auctions.map((auction: Auction) =>
        <AuctionListObject key={auction.auctionId} auction={auction}/>)

    return (
        <div>
            <Toolbar style={card}>
                <TextField fullWidth id="search-bar" label="Search" variant="outlined"
                           value={searchTitle} onChange={updateSearchTitleState}/>
                <Button onClick={getAuctions} variant="outlined">Search</Button>
            </Toolbar>
            {auction_rows()}
        </div>
    )
}
export default SearchBar;