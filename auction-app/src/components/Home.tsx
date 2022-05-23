import SearchBar from "./SearchBar";
import React from "react";
import axios from "axios";
import SelectCategories from "./SelectCategories";
import {Box, Button, Toolbar} from "@mui/material";
import AuctionListObject from "./AuctionListObject";
import CSS from "csstype";
import SelectStatus from "./SelectStatus";
import SelectSort from "./SelectSort";
import AuctionPagination from "./AuctionPagination";

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
        console.log("Getting auctions")
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
    }, [categories, status, sort, page, countPerPage])

    const auction_rows = () => auctions.map((auction: Auction) =>
        <AuctionListObject key={auction.auctionId} auction={auction} categories={allCategories}/>)

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
    }

    const box: CSS.Properties = {
        padding: "10px",
        margin: "20px",
    }

    return (
        <div>
            <Toolbar style={card}>
                <SearchBar setSearchTitle={setSearchTitle}/>
                <Button onClick={getAuctions} variant="outlined">Search</Button>
            </Toolbar>
            <Box style={box}>
                <SelectCategories categories={allCategories} setCategories={setCategories}/>
                <SelectStatus setStatus={setStatus}/>
                <SelectSort setSort={setSort}/>
            </Box>
            {auction_rows()}
            <AuctionPagination setPage={setPage} pageCount={pageCount} getAuctions={getAuctions} setCountPerPage={setCountPerPage}/>
        </div>
    )
}
export default Home;