import * as types from '../actions/actionTypes';
export default function createApiResponses() {
    return store => {
        return _apiResponses(store);
    };
}

function _apiResponses(store) {
    return next => action => {
        console.log("ACTIONTYPE:" + action.type);
        switch(action.type) {
            default:
                break;
        }
        return next(action);

        }
    };