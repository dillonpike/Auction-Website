import React from 'react';
import NavigationBar from "../components/NavigationBar";
import Button from "@mui/material/Button";
import {Box, Grid, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";

const LoginPage = () => {

    return (
        <Box>
            <NavigationBar/>
            <br/>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField label="Email" variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Password" variant="outlined" type="password" />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained">Login</Button>
                </Grid>
                <Grid item xs={12} sx={{ margin: 3 }}>
                    <Typography>Don't have an account?</Typography>
                    <Button variant="contained" href="/register">Register</Button>
                </Grid>
            </Grid>
        </Box>
    )
}
export default LoginPage;