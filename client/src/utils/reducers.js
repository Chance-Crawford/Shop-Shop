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
    UPDATE_CURRENT_CATEGORY,
    ADD_TO_CART,
    ADD_MULTIPLE_TO_CART,
    REMOVE_FROM_CART,
    UPDATE_CART_QUANTITY,
    CLEAR_CART,
    TOGGLE_CART
  } from './actions';
  
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
        // Let's not forget to include the ...state operator to preserve everything else on 
        // state. Then we can update the cart property to add action.product to the end of 
        // the array. We'll also set cartOpen to true so that users can immediately view 
        // the cart with the newly added item, if it's not already open.
        case ADD_TO_CART:
        return {
            ...state,
            cartOpen: true,
            cart: [...state.cart, action.product]
        };
        case REMOVE_FROM_CART:
        let removeItemIndex;

        // go through each item in the cart.
        let newState = state.cart.map((product, i) => {
            // action is the object we passed in when we called the reducer
            // from Detail.js
            // checks to see if the product in the carts id is the same
            // as the current product we passed in.
            // If they are not the same, return the product to the cart array
            // and continue on.
            if(product._id !== action._id){
                return product;
            }

            // if the product in the cart has a quantity that is greater then 0 still.
            // update the quantity in the new global state array and continue.
            if(action.purchaseQuantity > 0){
                product.purchaseQuantity = action.purchaseQuantity;
                return product;
            }
            else{
                removeItemIndex = i;
                return product;
            }
        });

        // if the removeItemIndex is defined then that means that an item should be
        // deleted from the cart since ther is no longer any quantity. 
        // so splice that object out of the new cart's array.
        if(removeItemIndex > -1){
            newState.splice(removeItemIndex, 1);
        }

        // now save the new cart to the global state.
        return {
            ...state,
            // check the length of the array to set cartOpen to 
            // false when the array is empty.
            cartOpen: newState.length > 0,
            cart: newState
        };
        case UPDATE_CART_QUANTITY:
        return {
            ...state,
            cartOpen: true,
            // we need to use the map() method to create a new array 
            // instead of updating state.cart directly
            // because the original state should be treated as immutable.
            cart: state.cart.map(product => {
            if (action._id === product._id) {
                product.purchaseQuantity = action.purchaseQuantity;
            }
            return product;
            })
        };
        // This test simply expects the cart to be empty (and closed) 
        // after the CLEAR_CART action is called.
        case CLEAR_CART:
        return {
            ...state,
            cartOpen: false,
            cart: []
        };
        // This test expects cartOpen to be the opposite of its previous 
        // value each time the action is called.
        case TOGGLE_CART:
        return {
            ...state,
            cartOpen: !state.cartOpen
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