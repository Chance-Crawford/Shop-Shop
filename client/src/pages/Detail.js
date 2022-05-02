import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Cart from '../components/Cart';

import { useStoreContext } from "../utils/Globalstate.js";
import {
  REMOVE_FROM_CART,
  UPDATE_CART_QUANTITY,
  ADD_TO_CART,
  UPDATE_PRODUCTS,
} from '../utils/actions';

import { QUERY_PRODUCTS } from '../utils/queries';
import spinner from '../assets/spinner.gif';

function Detail() {
  
  const [state, dispatch] = useStoreContext();
  // get id of product from url
  const { id } = useParams();

  const [currentProduct, setCurrentProduct] = useState({})

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  const { products, cart } = state;

  // the useEffect() Hook here has to check for a couple of things. It first 
  // checks to see if there's data in our global state's products array. If there 
  // is, we use it to figure out which product is the current one that we want to 
  // display. It does this finding the one with the matching _id value that we 
  // grabbed from the useParams() Hook. But what happens if we don't have any products 
  // in our global state object? What happens if someone just sent you this product's 
  // URL and this is the first time you've loaded this application?
  // If that's the case, then you wouldn't have any products saved in global state just 
  // yet. The useEffect() Hook is set up so that if we don't, we'll use the product data 
  // that we returned from the useQuery() Hook to set the product data to the global 
  // state object. When that's complete, we run through this all over again. But this time, 
  // there is data in the products array, and then we run setCurrentProduct() to display 
  // a single product's data.
  // This is why there are so many items in the second argument of the useEffect() Hook. 
  // The Hook's functionality is dependent on them to work and only runs when it detects 
  // that they've changed in value! This is known as the dependency array.
  useEffect(() => {
    if (products.length) {
      // Why are we saving the current product locally and not to the global state?
      // This is one of those cases where saving a single product to the global state object 
      // doesn't actually benefit us in any way, shape, or form. The single product's data 
      // will only be used in this specific component at this specific moment. This is the 
      // same reason why we don't worry about saving form entry data from the login or 
      // signup forms to global state; it only needs to exist when we're using those 
      // components!
      setCurrentProduct(products.find(product => product._id === id));
    } 
    // else if product query has returned with data.
    else if (data) {
      // save products to global storage
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products
      });
    }
  }, [products, data, dispatch, id]);

  // see ProductItem/index.js for comments
  const addToCart = () => {
    const itemInCart = cart.find((cartItem) => cartItem._id === id);
  
    if (itemInCart) {
      dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
    } else {
      dispatch({
        type: ADD_TO_CART,
        product: { ...currentProduct, purchaseQuantity: 1 }
      });
    }
  };

  // removes item from global state's cart object.
  const removeFromCart = () => {
    // find item in cart by comparing ids with the current product
    const itemInCart = cart.find((cartItem) => cartItem._id === id);

    dispatch(
      // this creates an "action" object with the below properties
      // and sends it to the reducer
      {
        type: REMOVE_FROM_CART,
        _id: currentProduct._id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) - 1
      }
    );
  };

  return (
    <>
      {currentProduct ? (
        <div className="container my-1">
          <Link to="/">← Back to Products</Link>

          <h2>{currentProduct.name}</h2>

          <p>{currentProduct.description}</p>

          <p>
            <strong>Price:</strong> ${currentProduct.price}{' '}
            <button onClick={addToCart}>Add to Cart</button>
            {/* disable the remove from cart button if the current
            product is not inside of the global state's cart object. */}
            <button 
              disabled={!cart.find(p => p._id === currentProduct._id)} 
              onClick={removeFromCart}
            >
              Remove from Cart
            </button>
          </p>

          <img
            src={`/images/${currentProduct.image}`}
            alt={currentProduct.name}
          />
        </div>
      ) : null}
      {loading ? <img src={spinner} alt="loading" /> : null}
      <Cart></Cart>
    </>
  );
}

export default Detail;
