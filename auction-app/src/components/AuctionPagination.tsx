import * as React from 'react';
import {Box, Pagination} from "@mui/material";
import CSS from "csstype";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

interface IPaginationProps {
    page: number
    setPage: Function
    pageCount: number
    getAuctions: Function
    setCountPerPage: Function
}

const AuctionPagination = (props: IPaginationProps) => {

    const updatePage = (event: React.ChangeEvent<unknown>, value: number) => {
        props.setPage(value)
    }

    const updateCountPerPage = (event: SelectChangeEvent) => {

        props.setCountPerPage(event.target.value)
    }

    const countPerPageOptions = () =>
        [5,6,7,8,9,10].map((num: number) => <MenuItem value={num}>{num}</MenuItem>)

    const box: CSS.Properties = {
        display: "flex",
        margin: "10px",
        padding: "10px",
        alignItems: "center",
        justifyContent: "center"
    }

    return (
        <Box style={box}>
            <Pagination count={props.pageCount} onChange={updatePage} page={props.page}/>
            <Select label="Auctions per Page" onChange={updateCountPerPage} defaultValue={"10"}>
                {countPerPageOptions()}
            </Select>
        </Box>
    )
}
export default AuctionPagination;