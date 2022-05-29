import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
// import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import {Link, useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import {getUser, isLoggedIn, logout} from "../api/api";
import {Alert, AlertColor, Grid, Snackbar} from "@mui/material";
import {useUserStore} from "../store";

const pages = ['Auctions'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const NavigationBar = () => {
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [userIsLoggedIn, setUserIsLoggedIn] = React.useState<boolean>(true);
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackSeverity, setSnackSeverity] = React.useState<AlertColor>("error")
    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    React.useEffect(() => {
        isLoggedIn(user.userId)
            .then((result: boolean) => {
                setUserIsLoggedIn(result)
            })
    }, [user])

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(null);
        if (event.currentTarget.innerText === "Logout") {
            handleLogout()
        }
    };

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

    const handleLogout = () => {
        logout().then((result) => {
            if (result) {
                navigate("/")
                setUserIsLoggedIn(false)
            } else {
                setSnackMessage(`Failed to logout`)
                setSnackOpen(true)
                setSnackSeverity("error")
            }
        })
    }

    const login_button = () => {
        return (
            <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
                <Button
                    key="Login"
                    onClick={() => {navigate("/login")}}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                >
                    Login
                </Button>
            </Box>
        )
    }

    const user_profile = () => {
        return (
            <div>
                <Grid container sx={{ flexGrow: 0 , display: "flex", alignItems: "center"}} spacing={1}>
                    <Grid item xs={11}>
                        <Typography>{user.firstName} {user.lastName}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar
                                    src={`http://localhost:4941/api/v1/users/${user.userId}/image`}
                                />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Grid>
                </Grid>
            </div>
        )
    }

    return (
        <div>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            LOGO
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                {/*<MenuIcon />*/}
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {pages.map((page) => (
                                    <MenuItem key={page} onClick={handleCloseNavMenu}>
                                        <Typography textAlign="center">{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                        <Typography
                            variant="h5"
                            noWrap
                            component="a"
                            href=""
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            LOGO
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Link to="/">
                                    <Button
                                        key={page}
                                        onClick={handleCloseNavMenu}
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        {page}
                                    </Button>
                                </Link>
                            ))}
                        </Box>
                        {userIsLoggedIn ? user_profile() : login_button()}
                    </Toolbar>
                </Container>
            </AppBar>
            {snackbar()}
        </div>
    );
};
export default NavigationBar;