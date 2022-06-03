import axios from "axios";
import Cookies from 'js-cookie';
import * as React from "react";
import {useNavigate} from "react-router-dom";

const register = async (firstName: string, lastName: string, email: string, password: string): Promise<any> => {
    return await axios.post('http://localhost:4941/api/v1/users/register',
        { firstName: firstName, lastName: lastName, email: email, password: password })
}

const login = async (email: string, password: string): Promise<any> => {
    return axios.post('http://localhost:4941/api/v1/users/login',
        { email: email, password: password })
        .then((response) => {
            Cookies.set('token', response.data.token)
            return response
        }, (error) => {
            return error.response
        })
}

const getUser = async (id: number): Promise<any> => {
    return axios.get(`http://localhost:4941/api/v1/users/${id}`,
        { headers: { 'X-Authorization': `${Cookies.get('token')}` }})
        .then((response) => {
            return response.data
        }, (error) => {
            throw error
        })
}

const isLoggedIn = async (id: number): Promise<boolean> => {
    try {
        if (Cookies.get('token') === undefined || id === -1) {
            return false;
        }
        return getUser(id).then((data) => data.hasOwnProperty('email'), (error) => false)
    } catch {
        return false;
    }
}

const logout = async (): Promise<boolean> => {
    return axios.post('http://localhost:4941/api/v1/users/logout', {},
        { headers: { 'X-Authorization': `${Cookies.get('token')}` }})
        .then((response) => {
            Cookies.remove('userId')
            Cookies.remove('token')
            return true
        }, (error) => {
            return false
        })
}

const getAuction = async (id: number | string) => {
    return await axios.get(`http://localhost:4941/api/v1/auctions/${id}`)
}

const getAuctionImage = async (id: number | string) => {
    return await axios.get(`http://localhost:4941/api/v1/auctions/${id}/image`)
}

const editAuction = async (id: number | string, title: string, description: string, categoryId: number, endDate: string, reserve: number) => {
    return await axios.patch(`http://localhost:4941/api/v1/auctions/${id}`, { title: title,
            description: description, categoryId: categoryId, endDate: endDate, reserve: reserve },
        { headers: { 'X-Authorization': `${Cookies.get('token')}` }})
}

const editAuctionImage = async (id: number | string, image: any) => {
    return await axios.put(`http://localhost:4941/api/v1/auctions/${id}/image`, image,
        { headers: { 'X-Authorization': `${Cookies.get('token')}`, 'Content-Type': image.type }})
}

const deleteAuction = async (id: number) => {
    return await axios.delete(`http://localhost:4941/api/v1/auctions/${id}`,
        { headers: { 'X-Authorization': `${Cookies.get('token')}` }})
}

export {register, login, getUser, isLoggedIn, logout, getAuction, getAuctionImage, editAuction, editAuctionImage, deleteAuction};