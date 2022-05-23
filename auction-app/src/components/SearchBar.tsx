import {TextField} from "@mui/material";
import React from "react";

interface ISearchTitleProps {
    setSearchTitle: Function
}

const SearchBar = (props: ISearchTitleProps) => {

    const updateSearchTitleState = (event: any) => {
        props.setSearchTitle(event.target.value)
    }

    return (
        <TextField fullWidth id="search-bar" label="Search" variant="outlined"
                   onChange={updateSearchTitleState}/>
    )
}
export default SearchBar;