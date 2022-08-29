import React from 'react';
import NavigationBar from "../components/NavigationBar";
import Button from "@mui/material/Button";
import {Box, Grid, InputAdornment, InputLabel, OutlinedInput, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import {getUser, isLoggedIn, login} from "../api/api";
import {useUserStore} from "../store";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {Link, useNavigate} from "react-router-dom";

interface State {
    email: string,
    password: string,
    showPassword: boolean,
    error: string
}

const LoginPage = () => {

    const [values, setValues] = React.useState<State>({
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

    const handleLogin = () => {
        login(values.email, values.password).then((response) => {
            if (response.data.hasOwnProperty("userId")) {
                navigate('/')
                const userId = response.data.userId
                getUser(response.data.userId).then((response) => {
                    setUser({
                        userId: userId,
                        firstName: response.firstName,
                        lastName: response.lastName,
                        email: response.email})
                })
            } else {
                setValues({...values, ['error']: response.statusText})
            }
        })
    }

    const handleKeyPress = (event: any) => {
        // Enter key
        if (event.key === "Enter") {
            handleLogin()
        }
    }

    return (
        <Box>
            <NavigationBar/>
            <br/>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField label="Email" variant="outlined" onKeyPress={handleKeyPress} style={{width: "250px"}} onChange={handleChange('email')} />
                </Grid>
                <Grid item xs={12}>
                    <FormControl style={{width: "250px"}} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={values.showPassword ? 'text' : 'password'}
                            value={values.password}
                            onChange={handleChange('password')}
                            onKeyPress={handleKeyPress}
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
                <Grid item xs={12}>
                    <Button variant="contained" onClick={handleLogin}>Login</Button>
                </Grid>
                <Grid item xs={12} sx={{ margin: 3 }}>
                    <Typography>Don't have an account?</Typography>
                    <Link to="/register">
                        <Button variant="contained">Register</Button>
                    </Link>
                </Grid>
            </Grid>
        </Box>
    )
}
export default LoginPage;