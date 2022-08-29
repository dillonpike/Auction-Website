import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface ISortProps {
    setSort: Function
}

const SelectSort = (props: ISortProps) => {

    const updateSort = (event: SelectChangeEvent) => {
        props.setSort(event.target.value)
    }

    return (
        <div>
            <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select label="Sort By" onChange={updateSort} defaultValue={"CLOSING_SOON"}>
                    <MenuItem value={"ALPHABETICAL_ASC"}>Alphabetically</MenuItem>
                    <MenuItem value={"ALPHABETICAL_DESC"}>Reverse Alphabetically</MenuItem>
                    <MenuItem value={"BIDS_ASC"}>Lowest Bid</MenuItem>
                    <MenuItem value={"BIDS_DESC"}>Highest Bid</MenuItem>
                    <MenuItem value={"RESERVE_ASC"}>Lowest Reserve</MenuItem>
                    <MenuItem value={"RESERVE_DESC"}>Highest Reserve</MenuItem>
                    <MenuItem value={"CLOSING_SOON"}>Closing Soon</MenuItem>
                    <MenuItem value={"CLOSING_LAST"}>Closing Latest</MenuItem>
                </Select>
            </FormControl>
        </div>
    )
}
export default SelectSort;