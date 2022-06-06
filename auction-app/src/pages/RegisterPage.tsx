import React from 'react';
import NavigationBar from "../components/NavigationBar";
import {
    Box,
    Card,
    CardMedia,
    FilledInput, FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import FormControl from "@mui/material/FormControl";
import {register, login, getUser, isLoggedIn, editUserImage, deleteUserImage} from "../api/api"
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import CSS from "csstype";

interface State {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    showPassword: boolean,
    image: any,
    error: string
}

interface ISnackProps {
    handleSnackSuccess: Function,
    handleSnackError: Function
}

const RegisterPage = (props: ISnackProps) => {

    const [imageUrl, setImageUrl] = React.useState<string>('')
    const [imageError, setImageError] = React.useState("")
    const [values, setValues] = React.useState<State>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        showPassword: false,
        image: null,
        error: ''
    });
    const [firstNameError, setFirstNameError] = React.useState("")
    const [lastNameError, setLastNameError] = React.useState("")
    const [emailError, setEmailError] = React.useState("")
    const [passwordError, setPasswordError] = React.useState("")
    const [emailInUse, setEmailInUse] = React.useState(false)
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

    const isValidEmail = (email: string) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
    }

    const checkInput = (): boolean => {
        let hasError = false;
        if (values.firstName.length < 1) {
            setFirstNameError("Must be at least 1 character")
            hasError = true
        } else {
            setFirstNameError("")
        }
        if (values.lastName.length < 1) {
            setLastNameError("Must be at least 1 character")
            hasError = true
        } else {
            setLastNameError("")
        }
        if (!isValidEmail(values.email)) {
            setEmailError("Must be of the form a@a.aa")
            setEmailInUse(false)
            hasError = true
        } else {
            setEmailError("")
        }
        if (values.password.length < 6) {
            setPasswordError("Must be at least 6 characters long")
            hasError = true
        } else {
            setPasswordError("")
        }
        return !hasError
    }

    const checkEmailInUse = (error: any): boolean => {
        if (error.response.statusText.includes("Bad Request: email already in use")) {
            setEmailError("Email already in use")
            setEmailInUse(true)
            return false
        } else {
            setEmailError("")
            setEmailInUse(false)
            return true
        }
    }

    const handleRegister = () => {
        if (checkInput()) {
            register(values.firstName, values.lastName, values.email, values.password)
                .then(() => {
                    login(values.email, values.password).then((response) => {
                        if (values.image !== null) {
                            editUserImage(response.data.userId, values.image).then((response) => {}, (error) => {
                                props.handleSnackError("Couldn't upload image")
                            })
                        }
                        navigate('/')
                        const userId = response.data.userId
                        getUser(response.data.userId).then((response) => {
                            setUser({
                                userId: userId,
                                firstName: response.firstName,
                                lastName: response.lastName,
                                email: response.email
                            })
                        })

                        }
                    )
                }, (error: any) => {
                    if (checkEmailInUse(error)) {
                        props.handleSnackError("Failed to save details")
                    }
                    // setValues({...values, ['error']: error.response.statusText})
                })
        }
    }

    const handleImage = (event: any) => {
        const image = event.target.files[0];
        if (["image/png", "image/jpeg", "image/gif"].includes(image.type)) {
            setImageUrl(URL.createObjectURL(image));
            setValues({...values, image: image});
            setImageError("")
        } else {
            setImageError("Please upload a .png, .jpg, .jpeg, or .gif file")
        }
    }

    const handleKeyPress = (event: any) => {
        // Enter key
        if (event.key === "Enter") {
            handleRegister()
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
                                image={imageUrl === "" ? require("../avatar.png") : imageUrl}
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
                            <TextField label="First Name *" variant="outlined" onChange={handleChange('firstName')}
                                       style={{width: "250px"}}
                                       onKeyPress={handleKeyPress}
                                       error={firstNameError !== "" && values.firstName === ""}
                                       helperText={firstNameError !== "" && values.firstName === "" ? firstNameError : ""} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Last Name *" variant="outlined" onChange={handleChange('lastName')}
                                       style={{width: "250px"}}
                                       onKeyPress={handleKeyPress}
                                       error={lastNameError !== "" && values.lastName === ""}
                                       helperText={lastNameError !== "" && values.lastName === "" ? lastNameError : ""}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Email *" variant="outlined" onChange={handleChange('email')}
                                       style={{width: "250px"}}
                                       onKeyPress={handleKeyPress}
                                       error={emailError !== "" && (!isValidEmail(values.email) || emailInUse)}
                                       helperText={emailError !== "" && (!isValidEmail(values.email) || emailInUse) ? emailError : ""}/>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl style={{width: "250px"}} variant="outlined">
                                <InputLabel htmlFor="outlined-adornment-password">Password *</InputLabel>
                                <OutlinedInput
                                    id="outlined-adornment-password"
                                    type={values.showPassword ? 'text' : 'password'}
                                    value={values.password}
                                    onChange={handleChange('password')}
                                    error={passwordError !== "" && values.password.length < 6}
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
                                    label="Password *"
                                />
                                <FormHelperText error>
                                    {passwordError !== "" && values.password.length < 6 ? passwordError : ""}
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography color={"red"}>{values.error}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" onClick={handleRegister}>Register</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    )
}
export default RegisterPage;