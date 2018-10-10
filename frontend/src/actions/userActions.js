import * as actionTypes from "./actionTypes";
import axios from 'axios';
import config from '../config';
export const requestLogin = (data) => {
    return {type: actionTypes.LOGIN_REQUEST, payload: data};
}

export const loginFailure = (data) => {
    return {type: actionTypes.LOGIN_FAILURE, payload: data};
}

export const loginSuccess = (data) => {
    return {type: actionTypes.LOGIN_SUCCESS, payload: data};
}


export function loginRequest(email, password) {
    var data = {
        email: email,
        password: password
    }
    return (dispatch) => {
        dispatch(requestLogin(data));

        axios.post(config.base_URL + '/authenticate', {
            email: email,
            password: password
        }).then((response) => {
            response = response.data;
            if(!response.success) {
                dispatch(loginFailure(response));
            } else {
                dispatch(loginSuccess(response));
                localStorage.setItem('token', response.token);
                axios.defaults.headers.common['x-access-token'] = localStorage.getItem('token');
            }
            console.log(response);
        }).catch((err) => {
            console.log('Error');
            console.log(err);
        });
    }
}

