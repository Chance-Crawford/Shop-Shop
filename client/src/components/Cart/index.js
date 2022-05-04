import React, { useEffect } from "react";
import CartItem from '../CartItem';
import Auth from '../../utils/auth';
import './style.css';

import { useStoreContext } from '../../utils/Globalstate.js';

import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from "../../utils/actions";
import { idbPromise } from "../../utils/helpers";

const Cart = () => {

    const [state, dispatch] = useStoreContext();

    // Currently the Cart component is populated with data from the global state 
    // object and not the useQuery() Hook, because the data doesn't come from the 
    // server. We want to set up this component to check for items saved in the 
    // cart object store of IndexedDB every single time the component opens
    // so that we can have cart persistance and 
    // repopulate the items that were in the cart previously on
    // reload. But how can we do that? We can use the useEffect() Hook!
    // check if there's anything in the state's cart property on load. If not, 
    // we'll retrieve data from the IndexedDB cart object store.
    useEffect(() => {
        async function getCart() {
            // gets all product objects saved in indexDB
          const cart = await idbPromise('cart', 'get');
          // adds all the products to the global state cart
          // We dispatch the ADD_MULTIPLE_TO_CART action here because we have an 
          // array of items returning from IndexedDB, even if it's just one product saved. 
          // This way we can just dump all of the products into the global state object 
          // at once instead of doing it one by one.
          dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
        };
      
        // if there are no items in global cart (which there wont be on reload)
        // call the function above.
        if (!state.cart.length) {
          getCart();
        }
        // useEffect will listen for changes in these variables and run this
        // code evertime there was a change.
        // You may wonder what happens if there's nothing to retrieve from the cached 
        // object store and state.cart.length is still 0. Does this useEffect() function 
        // just continuously run because of that?
        // Well, it could very easily do that if we neglect to pass the state.cart.length 
        // value into useEffect()'s dependency array. That's the whole point of the 
        // dependency array. We list all of the data that this useEffect() Hook is 
        // dependent on to execute. The Hook runs on load no matter what, but then it 
        // only runs again if any value in the dependency array has changed since the 
        // last time it ran.
    }, [state.cart.length, dispatch]);

    // This handler will toggle the cartOpen value in the global state
    // whenever the [close] text is clicked.
    function toggleCart() {
        dispatch({ type: TOGGLE_CART });
    }

    // This function will add up the prices of everything saved in 
    // state.cart, which can then be displayed in the JSX.
    function calculateTotal() {
        let sum = 0;
        state.cart.forEach(item => {
          sum += item.price * item.purchaseQuantity;
        });
        return sum.toFixed(2);
    }

    // if cart is closed in the global state
    if (!state.cartOpen) {
        return (
          <div className="cart-closed" onClick={toggleCart}>
            <span
              role="img"
              aria-label="trash">🛒</span>
          </div>
        );
    }

    return (
        <div className="cart">
        <div className="close" onClick={toggleCart}>[close]</div>
        <h2>Shopping Cart</h2>
        {state.cart.length ? (
            <div>
            {state.cart.map(item => (
                <CartItem key={item._id} item={item} />
            ))}
            <div className="flex-row space-between">
                <strong>Total: ${calculateTotal()}</strong>
                {
                Auth.loggedIn() ?
                    <button>
                    Checkout
                    </button>
                    :
                    <span>(log in to check out)</span>
                }
            </div>
            </div>
        ) : (
            <h3>
            <span role="img" aria-label="shocked">
                😱
            </span>
            You haven't added anything to your cart yet!
            </h3>
        )}
        </div>
    );
};

export default Cart;