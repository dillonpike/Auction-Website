import {Box, Card, CardContent, CardMedia, Stack, Typography} from "@mui/material";
import CSS from 'csstype';
import React from "react";

interface IBidProps {
    bid: Bid
}

const BidderListObject = (props: IBidProps) => {

    const userCardStyles: CSS.Properties = {
        display: "flex",
        margin: "10px",
        padding: "0px",
    }

    const getDateString = () => {
        const endDate = new Date(props.bid.timestamp)
        return `${endDate.toLocaleDateString('en-UK',
            {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})} 
            ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
            .replaceAll(',', '');
    }

    return (
        <Box>
            <Card sx={userCardStyles}>
                <CardMedia
                    component="img"
                    sx={{ width: 68, height: 68 }}
                    image={`http://localhost:4941/api/v1/users/${props.bid.bidderId}/image`}
                    onError={(event: any) => {event.target.src = `https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`}}
                />
                <CardContent>
                    <Stack direction="row" spacing={3}>
                        <Typography variant="subtitle1" component="div">${props.bid.amount}</Typography>
                        <Typography variant="subtitle1" component="div">{props.bid.firstName} {props.bid.lastName}</Typography>
                        <Typography variant="subtitle1" component="div">{getDateString()}</Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    )
}

export default BidderListObject;