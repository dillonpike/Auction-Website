import React from 'react';
import { useParams } from "react-router";
import {Box, Card, CardContent, CardMedia, Grid, Modal, Stack, TextField, Typography} from "@mui/material";
import UserListObject from "./UserListObject";
import CSS from "csstype";
import axios from "axios";
import BidderListObject from "./BidderListObject";
import AuctionListObject from "./AuctionListObject";
import NavigationBar from "./NavigationBar";
import {deleteAuction, isLoggedIn, placeBid} from "../api/api";
import Button from "@mui/material/Button";
import {Link, useNavigate} from "react-router-dom";
import {useUserStore} from "../store";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};

interface ISnackProps {
    handleSnackSuccess: Function,
    handleSnackError: Function
}

const AuctionPage = (props: ISnackProps) => {

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
    const [allowEdit, setAllowEdit] = React.useState(false)
    const [allowBid, setAllowBid] = React.useState(true)
    const [loggedIn, setLoggedIn] = React.useState(false)
    const [bidAmount, setBidAmount] = React.useState(1)
    const [bidAmountError, setBidAmountError] = React.useState("")
    const user = useUserStore(state => state.user)
    const navigate = useNavigate();

    const getCategory = () => {
        axios.get('http://localhost:4941/api/v1/auctions/categories')
            .then((response) => {
                setAllCategories(response.data)
                for (const category of response.data) {
                    if (category.categoryId === auction.categoryId) {
                        setCategory(category.name)
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
            {params: {categoryIds: [auction.categoryId]}})
            .then((response) => {
                const sameCategoryAuctions = response.data.auctions.filter((similarAuction: Auction) => auction.auctionId !== similarAuction.auctionId)
                const sameCategoryIds = sameCategoryAuctions.map((similarAuction: Auction) => similarAuction.auctionId)
                axios.get('http://localhost:4941/api/v1/auctions',
                    {params: {sellerId: auction.sellerId}})
                    .then((sellerResponse) => {
                        const sameSellerAuctions = sellerResponse.data.auctions.filter((similarAuction: Auction) =>
                            auction.auctionId !== similarAuction.auctionId && !sameCategoryIds.includes(similarAuction.auctionId))
                        setSimilarAuctions(sameCategoryAuctions.concat(sameSellerAuctions))
                    })
            })
    }

    React.useEffect(() => {
        getAuction()
        getBids()
    }, [setAuction, id])


    React.useEffect(() => {
        getCategory()
        getSimilarAuctions()
        setAllowEdit(false)
        setAllowBid(true)
        setBidAmount(auction.highestBid + 1)
        isLoggedIn(user.userId)
            .then((result: boolean) => {
                if (result) {
                    setLoggedIn(true)
                    if (auction.sellerId === user.userId) {
                        if (auction.numBids === 0) {
                            setAllowEdit(true)
                        }
                        setAllowBid(false)
                    }
                }
            })
        const endDate = new Date(auction.endDate)
        const now = new Date()
        if (endDate.getTime() - now.getTime() <= 0) {
            setAllowBid(false)
        }
    }, [auction])

    const getEndDateString = () => {
        const endDate = new Date(auction.endDate)
        return `${endDate.toLocaleDateString('en-UK',
            {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})} 
            ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
            .replaceAll(',', '');
    }

    const bidder_list = () => {
        if (bids.length > 0) {
            return bids.map((bid: Bid) => <BidderListObject key={bid.timestamp} bid={bid}/>)
        } else {
            return <Typography variant="subtitle1">No bids</Typography>
        }
    }

    const similar_auctions_list = () => {
        if (similarAuctions.length > 0) {
            return similarAuctions.map((similarAuction: Auction) =>
                <AuctionListObject key={similarAuction.auctionId} auction={similarAuction} categories={allCategories}/>)
        } else {
            return <Typography variant="subtitle1">No similar auctions</Typography>
        }
    }

    const edit_button = () => {
        return (
            <Link to={`/edit-auction/${id}`}>
                <Button variant="contained" >Edit Auction</Button>
            </Link>
        )
    }

    const delete_button = () => {
        return <Button color="error" variant="contained" onClick={handleDeleteModalOpen} >Delete Auction</Button>
    }

    const bid_button = () => {
        return <Button onClick={handleBidModalOpen} variant="contained" >Place bid</Button>
    }

    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
    const handleDeleteModalOpen = () => setDeleteModalOpen(true)
    const handleDeleteModalClose = () => setDeleteModalOpen(false)

    const [bidModalOpen, setBidModalOpen] = React.useState(false)
    const handleBidModalOpen = () => {
        if (!loggedIn) {
            props.handleSnackError("You must be logged in to place a bid")
            setBidModalOpen(false)
        } else {
            setBidModalOpen(true)
        }
    }
    const handleBidModalClose = () => setBidModalOpen(false)

    const delete_modal = () => {
        return (
            <Modal
                open={deleteModalOpen}
                onClose={handleDeleteModalClose}
            >
                <Box sx={style}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6" component="h2">
                                Are you sure you want to delete this auction?
                            </Typography>
                        </Grid>
                        <Grid item xs={12} style={{justifyContent: 'center'}}>
                            <Button color="error" variant="contained" onClick={handleDelete}>Confirm</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        )
    }

    const handleBidAmount = (event: any) => {
        setBidAmount(event.target.value)
    }

    const bid_modal = () => {
        return (
            <Modal
                open={bidModalOpen}
                onClose={handleBidModalClose}
            >
                <Box sx={style}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label="Amount" variant="outlined" value={bidAmount} onChange={handleBidAmount}
                                       error={bidAmountError !== "" && (isNaN(bidAmount) || bidAmount <= auction.highestBid || bidAmount.toString() === "" || !Number.isSafeInteger(parseFloat(String(bidAmount))))}
                                       helperText={bidAmountError !== "" && (isNaN(bidAmount) || bidAmount <= auction.highestBid || bidAmount.toString() === "" || !Number.isSafeInteger(parseFloat(String(bidAmount)))) ? bidAmountError : ""}/>
                        </Grid>
                        <Grid item xs={12} style={{justifyContent: 'center'}}>
                            <Button variant="contained" onClick={handleBid}>Place Bid</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        )
    }

    const handleDelete = () => {
        deleteAuction(auction.auctionId).then((response) => {
            navigate("/")
            props.handleSnackSuccess(`Deleted ${auction.title} auction`)
        }, (error) => {
            props.handleSnackError("Failed to delete auction")
        })
    }

    const checkBidAmount = () => {
        if (isNaN(bidAmount) || bidAmount <= auction.highestBid || bidAmount.toString() === "" || !Number.isSafeInteger(parseFloat(String(bidAmount)))) {
            setBidAmountError(`Must be a positive whole number greater than the highest bid ($${auction.highestBid})`)
            return false
        }
        setBidAmountError("")
        return true
    }

    const handleBid = () => {
        if (checkBidAmount()) {
            placeBid(auction.auctionId, parseInt(String(bidAmount), 10)).then((response) => {
                getBids()
                handleBidModalClose()
                props.handleSnackSuccess(`Placed bid`)
            }, (error) => {
                props.handleSnackError("Failed to place bid")
            })
        }
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
                        {similar_auctions_list()}
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Card sx={auctionCardStyles}>
                                    <CardContent>
                                        <Typography variant="h5" component="div">{auction.title}</Typography>
                                        <Typography variant="subtitle1" component="div">Closes on: {getEndDateString()}</Typography>
                                        <Typography variant="subtitle1">Category: {category}</Typography>
                                        <Typography variant="subtitle1">Description: {auction.description}</Typography>
                                        <Typography variant="subtitle1">Reserve: ${auction.reserve}</Typography>
                                        <Typography variant="subtitle1">Number of bids: {auction.numBids}</Typography>
                                        <UserListObject key={auction.sellerId} userId={auction.sellerId}/>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12}>
                                {allowEdit ? edit_button() : <div/>}
                            </Grid>
                            <Grid item xs={12}>
                                {allowEdit ? delete_button() : <div/>}
                                {delete_modal()}
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h5" component="div">Bidders</Typography>
                                {allowBid ? bid_button() : <div/>}
                                {bid_modal()}
                                {bidder_list()}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </div>
    )
}
export default AuctionPage;