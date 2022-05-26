import React from 'react';
import { useParams } from "react-router";
import {Box, Card, CardContent, CardMedia, Grid, Typography} from "@mui/material";
import UserListObject from "./UserListObject";
import CSS from "csstype";
import axios from "axios";
import BidderListObject from "./BidderListObject";
import AuctionListObject from "./AuctionListObject";

const AuctionPage = () => {

    const defaultAuction : Auction = {
        auctionId: 0,
        title: "Default",
        categoryId: 1,
        sellerId: 1,
        sellerFirstName: "",
        sellerLastName: "",
        reserve: 1,
        numBids: 0,
        highestBid: 0,
        endDate: "",
        description: ""
    }
    const { id } = useParams();
    const [auction, setAuction] = React.useState<Auction>(defaultAuction);
    const [similarAuctions, setSimilarAuctions] = React.useState<Array<Auction>>([]);
    const [allCategories, setAllCategories] = React.useState<Array<Category>>([]);
    const [category, setCategory] = React.useState("")
    const [bids, setBids] = React.useState<Array<Bid>>([])

    const getCategory = () => {
        axios.get('http://localhost:4941/api/v1/auctions/categories')
            .then((response) => {
                setAllCategories(response.data)
                for (const category of response.data) {
                    if (category.categoryId === auction.categoryId) {
                        setCategory(category.name)
                        console.log(category.name)
                        break
                    }
                }
            })
    }

    const getBids = () => {
        axios.get(`http://localhost:4941/api/v1/auctions/${id}/bids`)
            .then((response) => {
                setBids(response.data)
                // setErrorFlag(false)
                // setErrorMessage("")
            }, (error) => {
                // setErrorFlag(true)
                // setErrorMessage(error.toString())
            })
    }

    const getAuction = () => {
        axios.get(`http://localhost:4941/api/v1/auctions/${id}`)
            .then((response) => {
                setAuction(response.data)
                // setErrorFlag(false)
                // setErrorMessage("")
            }, (error) => {
                // setErrorFlag(true)
                // setErrorMessage(error.toString())
            })
    }

    const getSimilarAuctions = () => {
        axios.get('http://localhost:4941/api/v1/auctions',
            { params: { categoryIds: [auction.categoryId], sellerId: auction.sellerId }})
            .then((response) => {
                setSimilarAuctions(response.data.auctions.filter((similarAuction: Auction) => auction.auctionId != similarAuction.auctionId))
                // setErrorFlag(false)
                // setErrorMessage("")
            }, (error) => {
                // setErrorFlag(true)
                // setErrorMessage(error.toString())
            })
    }

    React.useEffect(() => {
        getAuction()
        getBids()
    }, [setAuction])

    React.useEffect(() => {
        getCategory()
        getSimilarAuctions()
    }, [auction])

    const getEndDateString = () => {
        const endDate = new Date(auction.endDate)
        return `${endDate.toLocaleDateString('en-UK',
            {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})} 
            ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
            .replaceAll(',', '');
    }

    const bidder_list = () => bids.map((bid: Bid) =>
        <BidderListObject key={bid.timestamp} bid={bid}/>)

    const auction_list = () => similarAuctions.map((similarAuction: Auction) =>
        <AuctionListObject key={similarAuction.auctionId} auction={similarAuction} categories={allCategories}/>)

    const auctionCardStyles: CSS.Properties = {
        display: "inline-block",
        margin: "10px",
        padding: "0px",
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Card sx={auctionCardStyles}>
                        <CardMedia
                            component="img"
                            height="500"
                            width="500"
                            sx={{objectFit:"contain"}}
                            image={`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`}
                            onError={(event: any) => {event.target.src = `https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`}}
                            alt="Auction hero"
                        />
                    </Card>
                    <Typography variant="h5" component="div">Similar Auctions</Typography>
                    {auction_list()}
                </Grid>
                <Grid item xs={6}>
                    <Card sx={auctionCardStyles}>
                        <CardContent>
                            <Typography variant="h5" component="div">{auction.title}</Typography>
                            <Typography variant="subtitle1" component="div">Closes on: {getEndDateString()}</Typography>
                            <Typography variant="subtitle1">Category: {category}</Typography>
                            <Typography variant="subtitle1">Description: {auction.description}</Typography>
                            <Typography variant="subtitle1">Reserve: {auction.reserve}</Typography>
                            <Typography variant="subtitle1">Number of bids: {auction.numBids}</Typography>
                            <UserListObject key={auction.sellerId} userId={auction.sellerId}/>
                        </CardContent>
                    </Card>
                    <Typography variant="h5" component="div">Bidders</Typography>
                    {bidder_list()}
                </Grid>
            </Grid>
        </Box>
    )
}
export default AuctionPage;