import React from 'react';
import NavigationBar from "../components/NavigationBar";
import {Box, FilledInput, Grid, InputAdornment, InputLabel, OutlinedInput, Select, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import FormControl from "@mui/material/FormControl";
import {register, login, getUser, isLoggedIn} from "../api/api"
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import {DatePicker} from "@mui/x-date-pickers";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import AuctionListObject from "../components/AuctionListObject";
import MenuItem from "@mui/material/MenuItem";
import {SelectChangeEvent} from "@mui/material/Select";

interface State {
    title: string,
    categoryId: string,
    endDate: Date | null,
    image: any,
    description: string,
    reserve: number
}

const CreateAuctionPage = () => {

    const [allCategories, setAllCategories] = React.useState<Array<Category>>([]);
    const [endDate, setEndDate] = React.useState<Date | null>(null);
    const [values, setValues] = React.useState<State>({
        title: '',
        categoryId: '1',
        endDate: null,
        image: null,
        description: '',
        reserve: 0
    });

    const navigate = useNavigate();
    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    React.useEffect(() => {
        isLoggedIn(user.userId)
            .then((result: boolean) => {
                if (!result) {
                    navigate("/")
                }
            })
    }, [user])

    const getAllCategories = () => {
        axios.get('http://localhost:4941/api/v1/auctions/categories')
            .then((response) => {
                setAllCategories(response.data)
            })
    }

    React.useEffect(() => {
        getAllCategories()
    }, [setAllCategories])

    const categories = () => allCategories.map((category: Category) =>
        <MenuItem value={category.categoryId}>{category.name}</MenuItem>)

    const handleCategory = (event: SelectChangeEvent) => {
        console.log(event.target.value)
        setValues({ ...values, categoryId: event.target.value })
    }


    const handleChange =
        (value: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setValues({ ...values, [value]: event.target.value });
        };

    const handleCreate = () => {
        axios.post('http://localhost:4941/api/v1/auctions', { title: values.title, description: values.description, categoryId: values.categoryId, endDate: values.endDate })
    }

    const handleImage = (event: any) => {
        console.log(event.target.value)
        setValues({ ...values, endDate: event.target.files[0] });
    }

    return (
        <Box>
            <NavigationBar/>
            <br/>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField label="Title" variant="outlined" onChange={handleChange('title')} />
                </Grid>
                <Grid item xs={12}>
                    <FormControl sx={{minWidth: '25ch' }}>
                        <InputLabel id="demo-simple-select-label">Category</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={values.categoryId}
                            label="Category"
                            onChange={handleCategory}
                        >
                            {categories()}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => {
                                setEndDate(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                    <input type="file" onChange={handleImage}/>
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Description" variant="outlined" onChange={handleChange('description')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Reserve" variant="outlined" onChange={handleChange('reserve')} />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" onClick={handleCreate}>Create Auction</Button>
                </Grid>
            </Grid>
        </Box>
    )
}
export default CreateAuctionPage;