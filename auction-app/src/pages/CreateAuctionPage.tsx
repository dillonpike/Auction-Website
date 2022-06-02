import React from 'react';
import NavigationBar from "../components/NavigationBar";
import {
    Alert, AlertColor,
    Box, Card, CardMedia,
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
import {
    register,
    login,
    getUser,
    isLoggedIn,
    getAuction,
    getAuctionImage,
    editAuction,
    editAuctionImage
} from "../api/api"
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
import {add} from "date-fns";
import CSS from "csstype";
import {useParams} from "react-router";

interface State {
    title: string,
    categoryId: string,
    endDate: string,
    image: any,
    description: string,
    reserve: number,
    error: string,
}

const CreateAuctionPage = () => {

    const { id } = useParams();
    const initialDate = add(new Date(),{days: 7});
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackSeverity, setSnackSeverity] = React.useState<AlertColor>("error")
    const [allCategories, setAllCategories] = React.useState<Array<Category>>([]);
    const [endDate, setEndDate] = React.useState<Date | null>(initialDate);
    const [imageUrl, setImageUrl] = React.useState<string>('');
    const [values, setValues] = React.useState<State>({
        title: '',
        categoryId: '1',
        endDate: initialDate.toISOString().replace('Z', '').replace('T', ' '),
        image: null,
        description: '',
        reserve: 1,
        error: ''
    });
    const [titleError, setTitleError] = React.useState("")
    const [endDateError, setEndDateError] = React.useState("")
    const [descriptionError, setDescriptionError] = React.useState("")
    const [imageError, setImageError] = React.useState("")

    const navigate = useNavigate();
    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    React.useEffect(() => {
        if (id === undefined) {
            checkRedirectToHome(user.userId)
        } else {
            getAuction(id)
                .then((response) => {
                    if (response.data.sellerId !== user.userId || response.data.numBids > 0) {
                        navigate("/")
                    }
                    getAuctionImage(id).then((imageResponse) => {
                        setValues({ ...values, title: response.data.title, description: response.data.description,
                            reserve: response.data.reserve, categoryId: response.data.categoryId,
                            endDate: response.data.endDate.replace('Z', '').replace('T', ' '), image: imageResponse.data })
                        setEndDate(response.data.endDate)
                        setImageUrl(`http://localhost:4941/api/v1/auctions/${id}/image`)
                    }, (error) => {
                        openErrorSnack("Failed to load details")
                    })
                }, (error) => {
                    navigate("/")
                })
        }
    }, [user, id])

    const checkRedirectToHome = (id: number) => {
        isLoggedIn(id)
            .then((result: boolean) => {
                if (!result) {
                    navigate("/")
                }
            })
    }

    const openErrorSnack = (message: string) => {
        setSnackMessage(message)
        setSnackOpen(true)
        setSnackSeverity("error")
    }


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

    const checkInput = (): boolean => {
        let hasError = false;
        if (values.title.length <= 0) {
            setTitleError("Must not be empty.")
            hasError = true;
        } else {
            setTitleError("")
        }
        if (values.description.length <= 0) {
            setDescriptionError("Must not be empty.")
            hasError = true
        } else {
            setDescriptionError("")
        }
        if (values.image === null) {
            setImageError("Please upload an image.")
            hasError = true
        } else {
            setImageError("")
        }
        return !hasError
    }

    const handleCreate = () => {
        if (checkInput()) {
            axios.post('http://localhost:4941/api/v1/auctions',
                {
                    title: values.title, description: values.description, categoryId: parseInt(values.categoryId, 10),
                    endDate: values.endDate
                }, {headers: {'X-Authorization': `${Cookies.get('token')}`}})
                .then((response) => {
                    editAuctionImage(response.data.auctionId, values.image)
                        .then((imageResponse) => {
                            navigate(`/auction/${response.data.auctionId}`)
                        }, (error) => {
                            navigate(`/auction/${response.data.auctionId}`)
                        })
                }, (error) => {
                    openErrorSnack("Failed to create auction")
                })
        }
    }

    const handleEdit = () => {
        if (checkInput() && id !== undefined) {
            editAuction(id, values.title, values.description, parseInt(values.categoryId, 10), values.endDate, values.reserve)
                .then((response) => {
                    editAuctionImage(id, values.image).then((imageResponse) => {
                        navigate(`/auction/${id}`)
                    }, (error) => {
                        navigate(`/auction/${id}`)
                    })
                }, (error) => {
                    openErrorSnack("Failed to save auction")
                })
        }
    }

    const handleImage = (event: any) => {
        setImageUrl(URL.createObjectURL(event.target.files[0]));
        setValues({ ...values, image: event.target.files[0] });
        setImageError("")
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

    const confirm_button = () => {
        if (id === undefined) {
            return <Button variant="contained" onClick={handleCreate}>Create Auction</Button>
        } else {
            return <Button variant="contained" onClick={handleEdit}>Save Auction</Button>
        }
    }

    const auctionCardStyles: CSS.Properties = {
        display: "inline-block",
        margin: "10px",
        padding: "0px",
    }

    return (
        <Box>
            <NavigationBar/>
            <br/>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Grid item xs={12}>
                        <Card sx={auctionCardStyles}>
                            <CardMedia
                                component="img"
                                height="500"
                                width="500"
                                sx={{objectFit:"contain"}}
                                image={imageUrl === "" ? "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg" : imageUrl}
                                alt="Auction hero"
                            />
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <label htmlFor="imageInput">
                            <input id="imageInput" multiple accept="image/jpg, image/png, image/gif" type="file" style={{ display: "none"}} onChange={handleImage}/>
                            <Typography color={"red"}>{imageError}</Typography>
                            <Button component="span" variant="contained">Upload Image</Button>
                        </label>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TextField label="Title"
                                       variant="outlined"
                                       value={values.title}
                                       onChange={handleChange('title')}
                                       error={titleError !== "" && values.title === ""}
                                       helperText={titleError !== "" && values.title === "" ? titleError : ""}
                                       required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl sx={{minWidth: '25ch' }}>
                                <InputLabel id="demo-simple-select-label">Category *</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={values.categoryId}
                                    label="Category *"
                                    onChange={handleCategory}
                                >
                                    {categories()}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="End Date *"
                                    value={endDate}
                                    onChange={(newValue) => {
                                        handleEndDate(newValue);

                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Description" variant="outlined" onChange={handleChange('description')}
                                       error={descriptionError !== "" && values.description === ""}
                                       helperText={descriptionError !== "" && values.description === "" ? descriptionError : ""}
                                       required value={values.description}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Reserve" variant="outlined" value={values.reserve} onChange={handleChange('reserve')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography color={"red"}>{values.error}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            {confirm_button()}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {snackbar()}
        </Box>
    )
}
export default CreateAuctionPage;