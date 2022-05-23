import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface IStatusProps {
    setStatus: Function
}

const SelectStatus = (props: IStatusProps) => {

    const updateStatus = (event: SelectChangeEvent) => {
        props.setStatus(event.target.value)
    }

    return (
        <div>
            <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" onChange={updateStatus}>
                    <MenuItem value={"ANY"}>Any</MenuItem>
                    <MenuItem value={"OPEN"}>Open</MenuItem>
                    <MenuItem value={"CLOSED"}>Closed</MenuItem>
                </Select>
            </FormControl>
        </div>
    )
}
export default SelectStatus;