import SearchBar from "./SearchBar";
import React from "react";
import axios from "axios";
import SelectCategories from "./SelectCategories";
import {Button, Toolbar} from "@mui/material";
import AuctionListObject from "./AuctionListObject";
import CSS from "csstype";
import Select from "react-select";

const Home = () => {

    const [allCategories, setAllCategories] = React.useState<Array<Category>>([])
    const [categories, setCategories] = React.useState<Array<Category>>([])
    const [searchTitle, setSearchTitle] = React.useState<string>("")
    const [auctions, setAuctions] = React.useState<Array<Auction>>([])

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
        <AuctionListObject key={auction.auctionId} auction={auction} categories={categories}/>)

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
    }

    const options = [
        {
            label: "Categories",
            value: 0,
            options: allCategories.map((category: Category) => {
                return {value: category.categoryId, label: category.name}
            })
        }
    ]

    const updateCategories = (event: any) => {
        setCategories(event.target.value)
    }

    return (
        <div>
            <Toolbar style={card}>
                <SearchBar setSearchTitle={setSearchTitle}/>
                <Button onClick={getAuctions} variant="outlined">Search</Button>
            </Toolbar>
            <Select isMulti className="basic-multi-select" options={options} placeholder="Categories"
                    onChange={updateCategories}/>
            {/*<SelectCategories categories={allCategories} setCategories={setCategories}/>*/}
            {auction_rows()}
        </div>
    )
}
export default Home;