import React from 'react';
import NavigationBar from "../components/NavigationBar";
import {Box, FilledInput, Grid, InputAdornment, InputLabel, OutlinedInput, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import FormControl from "@mui/material/FormControl";
import {register, login, getUser, isLoggedIn} from "../api/api"
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";

interface State {
    title: string,
    category: string,
    endDate: string,
    image: string,
    description: string,
    reserve: number
}

const CreateAuctionPage = () => {

    const [values, setValues] = React.useState<State>({
        title: '',
        category: '',
        endDate: '',
        image: '',
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


    const handleChange =
        (value: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setValues({ ...values, [value]: event.target.value });
        };

    return (
        <Box>
            <NavigationBar/>
            <br/>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField label="Title" variant="outlined" onChange={handleChange('title')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Category" variant="outlined" onChange={handleChange('category')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="endDate" variant="outlined" onChange={handleChange('endDate')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Image" variant="outlined" onChange={handleChange('image')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Description" variant="outlined" onChange={handleChange('description')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Reserve" variant="outlined" onChange={handleChange('reserve')} />
                </Grid>
            </Grid>
        </Box>
    )
}
export default CreateAuctionPage;