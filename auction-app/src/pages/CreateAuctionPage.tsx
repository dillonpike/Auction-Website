import React from 'react';
import NavigationBar from "../components/NavigationBar";
import {
    Alert, AlertColor,
    Box,
    FilledInput,
    Grid,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Select,
    Snackbar,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import FormControl from "@mui/material/FormControl";
import {register, login, getUser, isLoggedIn} from "../api/api"
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import AuctionListObject from "../components/AuctionListObject";
import MenuItem from "@mui/material/MenuItem";
import {SelectChangeEvent} from "@mui/material/Select";
import Cookies from "js-cookie";

interface State {
    title: string,
    categoryId: string,
    endDate: string,
    image: any,
    description: string,
    reserve: number,
    error: string
}

const CreateAuctionPage = () => {

    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackSeverity, setSnackSeverity] = React.useState<AlertColor>("error")
    const [allCategories, setAllCategories] = React.useState<Array<Category>>([]);
    const [endDate, setEndDate] = React.useState<Date | null>(null);
    const [imageUrl, setImageUrl] = React.useState<string>('');
    const [values, setValues] = React.useState<State>({
        title: '',
        categoryId: '1',
        endDate: '',
        image: null,
        description: '',
        reserve: 1,
        error: ''
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
        setValues({ ...values, categoryId: event.target.value })
    }

    const handleEndDate = (date: Date | null) => {
        setEndDate(date);
        if (date !== null) {
            try {
                setValues({...values, endDate: date.toISOString().replace('Z', '').replace('T', ' ')})
            } catch {}
        }
    }

    const handleChange =
        (value: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setValues({ ...values, [value]: event.target.value });
        };

    const handleCreate = () => {
        axios.post('http://localhost:4941/api/v1/auctions',
            { title: values.title, description: values.description, categoryId: parseInt(values.categoryId, 10),
                endDate: values.endDate}, { headers: { 'X-Authorization': `${Cookies.get('token')}` }})
            .then((response) => {
                axios.put(`http://localhost:4941/api/v1/auctions/${response.data.auctionId}/image`,
                    values.image, { headers: { 'X-Authorization': `${Cookies.get('token')}`, 'Content-Type': values.image.type }})
                    .then((response2) => {
                        navigate(`/auction/${response.data.auctionId}`)
                    }, (error) => {
                        navigate(`/auction/${response.data.auctionId}`)
                        setSnackMessage(`Failed to upload image`)
                        setSnackOpen(true)
                        setSnackSeverity("error")
                    })
            }, (error) => {
                setSnackMessage(`Failed to create auction`)
                setSnackOpen(true)
                setSnackSeverity("error")
            })
    }

    const handleImage = (event: any) => {
        setImageUrl(URL.createObjectURL(event.target.files[0]));
        setValues({ ...values, image: event.target.files[0] });
    }

    const handleSnackClose = (event?: React.SyntheticEvent | Event,
                              reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };

    const snackbar = () => {
        return (
            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}
            >
                <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{
                    width: '100%' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        )
    }

    return (
        <Box>
            <NavigationBar/>
            <br/>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Grid item xs={12}>
                        <img
                            src={imageUrl}
                            onError={(event: any) => {event.target.src = `https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg`}}
                            style={{ maxHeight: 1000, maxWidth: 1000 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <label htmlFor="imageInput">
                            <input id="imageInput" multiple accept="image/jpg, image/png, image/gif" type="file" style={{ display: "none"}} onChange={handleImage}/>
                            <Button component="span" variant="contained">Upload Image</Button>
                        </label>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
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
                                <DateTimePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(newValue) => {
                                        handleEndDate(newValue);

                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Description" variant="outlined" onChange={handleChange('description')} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Reserve" variant="outlined" onChange={handleChange('reserve')} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography color={"red"}>{values.error}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" onClick={handleCreate}>Create Auction</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {snackbar()}
        </Box>
    )
}
export default CreateAuctionPage;