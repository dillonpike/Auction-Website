import React from 'react';
import NavigationBar from "../components/NavigationBar";
import {Box, Card, CardContent, CardMedia, Grid, Typography} from "@mui/material";
import UserListObject from "../components/UserListObject";
import CSS from "csstype";
import {useUserStore} from "../store";
import axios from "axios";
import AuctionListObject from "../components/AuctionListObject";
import {isLoggedIn} from "../api/api";
import {useNavigate} from "react-router-dom";

interface ISnackProps {
    handleSnackSuccess: Function,
    handleSnackError: Function
}

const ProfilePage = (props: ISnackProps) => {

    const [myAuctions, setMyAuctions] = React.useState<Array<Auction>>([])
    const [allCategories, setAllCategories] = React.useState<Array<Category>>([])
    const user = useUserStore(state => state.user)
    const navigate = useNavigate()

    React.useEffect(() => {
        isLoggedIn(user.userId)
            .then((result: boolean) => {
                if (result) {
                    getAllCategories()
                    getMyAuctions()
                } else {
                    navigate("/")
                    props.handleSnackError("You must be logged in to view your profile")
                }
            })
    }, [user])

    const getMyAuctions = () => {
        axios.get('http://localhost:4941/api/v1/auctions',
            {params: {sellerId: user.userId}})
            .then((response) => {
                setMyAuctions(response.data.auctions)
            })
    }

    const my_auctions_list = () => {
        if (myAuctions.length > 0) {
            return myAuctions.map((myAuction: Auction) =>
                <AuctionListObject key={myAuction.auctionId} auction={myAuction} categories={allCategories}/>)
        } else {
            return <Typography variant="subtitle1">No auctions</Typography>
        }
    }

    const getAllCategories = () => {
        axios.get('http://localhost:4941/api/v1/auctions/categories').then((response) => {
                setAllCategories(response.data)
            })
    }

    const auctionCardStyles: CSS.Properties = {
        display: "inline-block",
        margin: "10px",
        padding: "0px",
    }

    return (
        <div>
            <NavigationBar/>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h3" component="div">Profile</Typography>
                <Card sx={auctionCardStyles}>
                    <CardMedia
                        component="img"
                        height="500"
                        width="500"
                        sx={{objectFit:"contain"}}
                        image={`http://localhost:4941/api/v1/users/${user.userId}/image`}
                        onError={(event: any) => {event.target.src = require("../avatar.png")}}
                        alt="User hero"
                    />
                    <CardContent>
                        <Typography variant="h5" component="div">{user.firstName} {user.lastName}</Typography>
                        <Typography variant="subtitle1" component="div">Email: {user.email}</Typography>
                    </CardContent>
                </Card>
                <Typography variant="h5" component="div">My Auctions</Typography>
                {my_auctions_list()}
            </Box>
        </div>
    )
}
export default ProfilePage;