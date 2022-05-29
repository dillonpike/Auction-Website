import axios from "axios";
import Cookies from 'js-cookie';
import * as React from "react";

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

export {register, login, getUser, isLoggedIn, logout};