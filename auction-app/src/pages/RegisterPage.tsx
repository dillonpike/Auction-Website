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
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    showPassword: boolean,
    error: string
}

const RegisterPage = () => {

    const [values, setValues] = React.useState<State>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        showPassword: false,
        error: ''
    });
    const navigate = useNavigate();
    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    React.useEffect(() => {
        isLoggedIn(user.userId)
            .then((result: boolean) => {
                if (result) {
                    navigate("/")
                }
            })
    }, [user])


    const handleChange =
        (value: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setValues({ ...values, [value]: event.target.value });
        };

    const handleClickShowPassword = () => {
        setValues({
            ...values,
            showPassword: !values.showPassword,
        });
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    }

    const handleRegister = () => {
        register(values.firstName, values.lastName, values.email, values.password)
            .then(() => {
                login(values.email, values.password).then((response) => {
                    navigate('/')
                    const userId = response.data.userId
                    getUser(response.data.userId).then((response) => {
                        setUser({
                            userId: userId,
                            firstName: response.firstName,
                            lastName: response.lastName,
                            email: response.email})
                    })

                    }
                )
            }, (error: any) => {
                setValues({...values, ['error']: error.response.statusText})
            })
    }

    return (
        <Box>
            <NavigationBar/>
            <br/>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField label="First Name" variant="outlined" onChange={handleChange('firstName')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Last Name" variant="outlined" onChange={handleChange('lastName')} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Email" variant="outlined" onChange={handleChange('email')} />
                </Grid>
                <Grid item xs={12}>
                    <FormControl sx={{width: '25ch' }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={values.showPassword ? 'text' : 'password'}
                            value={values.password}
                            onChange={handleChange('password')}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {values.showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Typography color={"red"}>{values.error}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ margin: 3 }}>
                    <Button variant="contained" onClick={handleRegister}>Register</Button>
                </Grid>
            </Grid>
        </Box>
    )
}
export default RegisterPage;