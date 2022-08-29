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
import {
    register,
    login,
    getUser,
    isLoggedIn,
    editUserImage,
    getAuction,
    getAuctionImage,
    getUserImage, editUser, editAuctionImage, editUserWithPassword, deleteUserImage
} from "../api/api"
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../store";
import CSS from "csstype";

interface State {
    firstName: string,
    lastName: string,
    email: string,
    currentPassword: string
    password: string,
    showCurrentPassword: boolean,
    showPassword: boolean,
    image: any,
    error: string
}

interface ISnackProps {
    handleSnackSuccess: Function,
    handleSnackError: Function
}

const EditProfilePage = (props: ISnackProps) => {

    const [imageUrl, setImageUrl] = React.useState<string>('')
    const [imageError, setImageError] = React.useState("")
    const [values, setValues] = React.useState<State>({
        firstName: '',
        lastName: '',
        email: '',
        currentPassword: '',
        password: '',
        showCurrentPassword: false,
        showPassword: false,
        image: null,
        error: ''
    });
    const [firstNameError, setFirstNameError] = React.useState("")
    const [lastNameError, setLastNameError] = React.useState("")
    const [emailError, setEmailError] = React.useState("")
    const [currentPasswordError, setCurrentPasswordError] = React.useState("")
    const [passwordError, setPasswordError] = React.useState("")
    const [emailInUse, setEmailInUse] = React.useState(false)
    const navigate = useNavigate();
    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    React.useEffect(() => {
        isLoggedIn(user.userId)
            .then((result: boolean) => {
                if (!result) {
                    navigate("/")
                    props.handleSnackError("You must be logged in to edit your profile")
                }
            })
        getUserImage(user.userId).then((response) => {
            setValues({ ...values, firstName: user.firstName, lastName: user.lastName,
                email: user.email, image: response.data })
            setImageUrl(`http://localhost:4941/api/v1/users/${user.userId}/image`)
        }, (error) => {
            if (error.response.status === 404) {
                setValues({ ...values, firstName: user.firstName, lastName: user.lastName,
                    email: user.email})
            } else {
                props.handleSnackError("Failed to load details")
            }
        })
    }, [user])


    const handleChange =
        (value: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setValues({ ...values, [value]: event.target.value });
        };

    const handleClickShowCurrentPassword = () => {
        setValues({
            ...values,
            showCurrentPassword: !values.showCurrentPassword,
        });
    }

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

    const handleImage = (event: any) => {
        const image = event.target.files[0];
        try {
            if (["image/png", "image/jpeg", "image/gif"].includes(image.type)) {
                setImageUrl(URL.createObjectURL(image));
                setValues({...values, image: image});
                setImageError("")
                event.target.value = ""
            } else {
                setImageError("Please upload a .png, .jpg, .jpeg, or .gif file")
            }
        } catch {}
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
        return !hasError
    }

    const checkPasswordInput = (): boolean => {
        if (values.password.length < 6) {
            setPasswordError("Must be at least 6 characters long")
            return false
        } else {
            setPasswordError("")
            return true
        }
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

    const checkInvalidCurrentPassword = (error: any): boolean => {
        if (error.response.statusText.includes("Invalid password(s)")) {
            setCurrentPasswordError("Current password is incorrect")
            return false
        } else {
            setCurrentPasswordError("")
            return true
        }
    }

    const checkProfileImage = (): boolean => {
        try {
            return values.image.type !== undefined
        } catch {
            return false
        }
    }

    const handleKeyPress = (event: any) => {
        // Enter key
        if (event.key === "Enter") {
            handleEdit()
        }
    }

    const handleEdit = () => {
        if (values.currentPassword === "" && values.password === "") {
            if (checkInput()) {
                editUser(user.userId, values.firstName, values.lastName, values.email).then((response) => {
                    setUser({
                        userId: user.userId,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        email: values.email
                    })
                    if (checkProfileImage()) {
                        editUserImage(user.userId, values.image).then((imageResponse) => {
                            navigate(`/profile`)
                            props.handleSnackSuccess(`Saved details`)
                        }, (error) => {
                            navigate(`/profile`)
                            props.handleSnackError("Failed to upload image")
                        })
                    } else {
                        navigate(`/profile`)
                        props.handleSnackSuccess(`Saved details`)
                    }
                }, (error) => {
                    if (checkEmailInUse(error)) {
                        props.handleSnackError("Failed to save details")
                    }
                })
            }
        } else {
            if (checkPasswordInput()) {
                editUserWithPassword(user.userId, values.firstName, values.lastName, values.email, values.password, values.currentPassword).then((response) => {
                    setUser({
                        userId: user.userId,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        email: values.email
                    })
                    if (values.image !== null && values.image.type !== undefined) {
                        editUserImage(user.userId, values.image).then((imageResponse) => {
                            navigate(`/profile`)
                            props.handleSnackSuccess(`Saved details`)
                        }, (error) => {
                            navigate(`/profile`)
                            props.handleSnackError("Failed to upload image")
                        })
                    } else {
                        navigate(`/profile`)
                        props.handleSnackSuccess(`Saved details`)
                    }
                }, (error) => {
                    if (checkEmailInUse(error) && checkInvalidCurrentPassword(error)) {
                        props.handleSnackError("Failed to save details")
                    }
                })
            }
        }
    }

    const handleImageDelete = () => {
        if (values.image !== null) {
            deleteUserImage(user.userId).then((response) => {
                setImageUrl("");
                setValues({...values, image: null});
                setImageError("")
            }, (error) => {
                if (error.response.status === 404) {
                    setImageUrl("");
                    setValues({...values, image: null});
                    setImageError("")
                } else {
                    props.handleSnackError("Failed to delete image")
                }
            })
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
                    <Grid item xs={12}>
                        <Button color="error" variant="contained" onClick={handleImageDelete}>Delete Image</Button>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TextField label="First Name *" variant="outlined" value={values.firstName} onChange={handleChange('firstName')}
                                       style={{width: "250px"}}
                                       onKeyPress={handleKeyPress}
                                       error={firstNameError !== "" && values.firstName === ""}
                                       helperText={firstNameError !== "" && values.firstName === "" ? firstNameError : ""} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Last Name *" variant="outlined" value={values.lastName} onChange={handleChange('lastName')}
                                       style={{width: "250px"}}
                                       onKeyPress={handleKeyPress}
                                       error={lastNameError !== "" && values.lastName === ""}
                                       helperText={lastNameError !== "" && values.lastName === "" ? lastNameError : ""}/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Email *" variant="outlined" value={values.email} onChange={handleChange('email')}
                                       style={{width: "250px"}}
                                       onKeyPress={handleKeyPress}
                                       error={emailError !== "" && (!isValidEmail(values.email) || emailInUse)}
                                       helperText={emailError !== "" && (!isValidEmail(values.email) || emailInUse) ? emailError : ""}/>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl style={{width: "250px"}} variant="outlined">
                                <InputLabel htmlFor="outlined-adornment-currentPassword">Current Password</InputLabel>
                                <OutlinedInput
                                    id="outlined-adornment-currentPassword"
                                    type={values.showCurrentPassword ? 'text' : 'password'}
                                    value={values.currentPassword}
                                    onChange={handleChange('currentPassword')}
                                    error={currentPasswordError !== ""}
                                    onKeyPress={handleKeyPress}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowCurrentPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                            >
                                                {values.showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Current Password"
                                />
                                <FormHelperText error>
                                    {currentPasswordError !== "" ? currentPasswordError : ""}
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl style={{width: "250px"}} variant="outlined">
                                <InputLabel htmlFor="outlined-adornment-password">New Password</InputLabel>
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
                                    label="New Password"
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
                            <Button variant="contained" onClick={handleEdit}>Save</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    )
}
export default EditProfilePage;