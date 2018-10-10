import * as actionTypes from '../actions/actionTypes';
export const initialState = {
    loggedIn: false,
    userName: '',
    email: '',
    password: '',
    loginFailureMessage: '',
    errorMessage: '',
    admin: false,
}




const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.LOGIN_REQUEST:
            return {
                ...initialState,
                email: action.payload.email
            }
        case actionTypes.LOGIN_FAILURE:
            return {
                ...initialState,
                loginFailureMessage: action.payload.message
            }
        case actionTypes.LOGIN_SUCCESS:
            console.log(action);

            return {
                ...state,
                loggedIn: true,
                admin: action.payload.admin
            }
        default:
            return state;
    }
}

export default userReducer;