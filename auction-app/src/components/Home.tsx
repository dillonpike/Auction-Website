import SearchBar from "./SearchBar";
import React from "react";
import axios from "axios";
import SelectCategories from "./SelectCategories";
import {Box, Button, Grid, Toolbar} from "@mui/material";
import AuctionListObject from "./AuctionListObject";
import CSS from "csstype";
import SelectStatus from "./SelectStatus";
import SelectSort from "./SelectSort";
import AuctionPagination from "./AuctionPagination";
import NavigationBar from "./NavigationBar";

const Home = () => {

    const [allCategories, setAllCategories] = React.useState<Array<Category>>([])
    const [categories, setCategories] = React.useState<Array<Category>>([])
    const [searchTitle, setSearchTitle] = React.useState<string>("")
    const [auctions, setAuctions] = React.useState<Array<Auction>>([])
    const [status, setStatus] = React.useState<string>("ANY")
    const [sort, setSort] = React.useState<string>("CLOSING_SOON")
    const [page, setPage] = React.useState<number>(1)
    const [pageCount, setPageCount] = React.useState<number>(1)
    const [countPerPage, setCountPerPage] = React.useState<number>(10)

    React.useEffect(() => {
        const getAllCategories = () => {
            axios.get('http://localhost:4941/api/v1/auctions/categories')
                .then((response) => {
                    setAllCategories(response.data)
                })
        }
        getAllCategories()
    }, [setAllCategories])

    const getAuctions = () => {
        axios.get('http://localhost:4941/api/v1/auctions',
            { params: { q: searchTitle, categoryIds: categories.map((c: Category) => {return c.categoryId}),
                               status: status, sortBy: sort, startIndex: (page-1) * countPerPage, count: countPerPage }})
            .then((response) => {
                setAuctions(response.data.auctions)
                setPageCount(Math.ceil(response.data.count / countPerPage))
                // setErrorFlag(false)
                // setErrorMessage("")
            }, (error) => {
                // setErrorFlag(true)
                // setErrorMessage(error.toString())
            })
    }

    React.useEffect(() => {
        getAuctions()
    }, [page])

    React.useEffect(() => {
        if (page !== 1) {
            setPage(1)
        } else {
            getAuctions()
        }
    }, [categories, status, sort, searchTitle, countPerPage])

    const auction_list = () => auctions.map((auction: Auction) =>
        <AuctionListObject key={auction.auctionId} auction={auction} categories={allCategories}/>)

    const box: CSS.Properties = {
        padding: "30px",
    }

    return (
        <div>
            <NavigationBar/>
            <Grid container spacing={2} style={box}>
                <Grid item xs={12}>
                    <SearchBar setSearchTitle={setSearchTitle}/>
                </Grid>
                <Grid item xs={4}>
                    <SelectCategories categories={allCategories} setCategories={setCategories}/>
                </Grid>
                <Grid item xs={4}>
                    <SelectStatus setStatus={setStatus}/>
                </Grid>
                <Grid item xs={4}>
                    <SelectSort setSort={setSort}/>
                </Grid>
            </Grid>
            {auction_list()}
            <AuctionPagination page={page} setPage={setPage} pageCount={pageCount} getAuctions={getAuctions} setCountPerPage={setCountPerPage}/>
        </div>
    )
}
export default Home;