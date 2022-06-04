import {Box, Card, CardContent, CardMedia, Typography} from "@mui/material";
import CSS from 'csstype';
import React from "react";
import axios from "axios";

interface IUserIdProps {
    userId: number
}

const UserListObject = (props: IUserIdProps) => {

    const myObject = {
        userId: 1,
        firstName: "string",
        lastName: "string",
        email: "string"
    };

    const [userId] = React.useState(props.userId)
    const [user, setUser] = React.useState<User>(myObject)

    React.useEffect(() => {
        const getUser = () => {
            axios.get(`http://localhost:4941/api/v1/users/${userId}`)
                .then((response) => {
                    setUser(response.data)
                }, () => {
                    console.log("bruh")
                })
        }
        getUser()
    }, [setUser])

    const userCardStyles: CSS.Properties = {
        display: "flex",
        margin: "10px",
        padding: "0px",
    }

    return (
        <Card sx={userCardStyles}>
            <CardMedia
                component="img"
                sx={{ width: 68, height: 68 }}
                image={`http://localhost:4941/api/v1/users/${userId}/image`}
                onError={(event: any) => {event.target.src = require("../avatar.png")}}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography variant="subtitle1" component="div">{user.firstName} {user.lastName}</Typography>
                </CardContent>
            </Box>
        </Card>
    )
}

export default UserListObject;