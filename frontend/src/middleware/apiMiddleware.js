import { RSAA } from 'redux-api-middleware'; // RSAA = '@@redux-api-middleware/RSAA'
import * as types from '../actions/actionTypes';

let headers = {
    'Content-Type' : 'application/json',
    'Accept': 'application/json'
}

export function authenticate(email, password) {
    return {
        [RSAA]: {
            endpoint: 'http://localhost:3500/api/authenticate',
            method: 'POST',
            body: JSON.stringify({email: email, password: password}),
            headers: headers,
            types: [{ 
                type: types.LOGIN_REQUEST,
                payload: (action, state) => ({email: email})
            }, types.LOGIN_SUCCESS, types.LOGIN_FAILURE]
        }
    }
}

