// see google docs redux and stripe in MERN, create initial test and what is redux

// What we need to do is set up a function that will know how to take in our state and 
// update it through our 
// reducer() function. Luckily, we'll lean on another React Hook, called useReducer()!
// The useState() Hook is great for managing simpler amounts of state, like form field 
// values and the status of a button being clicked. The useReducer() Hook is meant 
// specifically for managing a greater level of state, like we're doing now.
import { useReducer } from 'react';

import {
    UPDATE_PRODUCTS,
    UPDATE_CATEGORIES,
    UPDATE_CURRENT_CATEGORY
} from "./actions";
  
// Adding this code to the reducers.js file imports the possible actions we can perform 
// and creates a function called reducer(). When the function executes, we pass the value 
// of the action.type argument into a switch statement and compare it to our possible actions.
export const reducer = (state, action) => {
    switch (action.type) {
        // if action type value is the value of `UPDATE_PRODUCTS`, return a new state object with an updated products array
        case UPDATE_PRODUCTS:
        return {
            ...state,
            products: [...action.products],
        };
        // if action type value is the value of `UPDATE_CATEGORIES`, return a new state object with an updated categories array
        case UPDATE_CATEGORIES:
        return {
          ...state,
          categories: [...action.categories]
        };
        case UPDATE_CURRENT_CATEGORY:
        return {
            ...state,
            currentCategory: action.currentCategory
        };

        // if it's none of these actions, do not update state at all and keep things the same!
        default:
        return state;
    }
};

// This function, useProductReducer(), will be used to help initialize our global state object 
// and then provide us with the functionality for updating that state by automatically 
// running it through our custom reducer() function. Think of this as a more in-depth way 
// of using the useState() Hook we've used so much.
export function useProductReducer(initialState) {
    return useReducer(reducer, initialState);
};