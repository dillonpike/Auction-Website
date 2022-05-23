import {Card, CardContent, CardMedia, Typography} from "@mui/material";
import CSS from 'csstype';
import React from "react";
import axios from "axios";
import UserListObject from "./UserListObject";

interface IAuctionProps {
    auction: Auction
    categories: Array<Category>
}

const AuctionListObject = (props: IAuctionProps) => {

    const [auction] = React.useState<Auction>(props.auction)
    const [categories, setCategories] = React.useState<Array<Category>>(props.categories)
    const [category, setCategory] = React.useState("")

    React.useEffect(() => {
        const getCategory = () => {
            for (const category of categories) {
                if (category.categoryId === auction.categoryId) {
                    setCategory(category.name)
                    break
                }
            }
        }
        getCategory()
    }, [setCategory])

    const getDaysUntilClose = () => {
        const oneDay = 1000 * 3600 * 24
        const endDate = new Date(auction.endDate)
        const now = new Date()
        return Math.floor(Math.max(0, (endDate.getTime() - now.getTime()) / oneDay))
    }

    const daysUntilClose = () => {
        let days = getDaysUntilClose()
        return <Typography variant="subtitle1">{days === 0 ? "Closed" : `Closes in ${days} days`}</Typography>
    }

    const getHighestBid = () => {
        return auction.highestBid === null ? 0 : auction.highestBid
    }

    const auctionCardStyles: CSS.Properties = {
        display: "inline-block",
        // height: "328px",
        width: "300px",
        margin: "10px",
        padding: "0px"
    }

    return (
        <Card sx={auctionCardStyles}>
            <CardMedia
                component="img"
                height="200"
                width="200"
                sx={{objectFit:"contain"}}
                image={`http://localhost:4941/api/v1/auctions/${auction.auctionId}/image`}
                onError={(event: any) => {event.target.src = `https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`}}
                alt="Auction hero"
            />
            <CardContent>
                <Typography variant="h5" component="div">{auction.title}</Typography>
                {daysUntilClose()}
                <Typography variant="subtitle1">Category: {category}</Typography>
                <Typography variant="subtitle1" component="div">Highest bid: ${getHighestBid()}</Typography>
                <Typography variant="subtitle1" component="div">
                    Reserve: ${auction.reserve} {getHighestBid() >= auction.reserve ? "(Met)" : ""}
                </Typography>
                <UserListObject key={auction.sellerId} userId={auction.sellerId}/>
            </CardContent>
        </Card>
    )
}

export default AuctionListObject;