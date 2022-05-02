import React from "react";
import { Link } from "react-router-dom";
import { pluralize } from "../../utils/helpers"

import { useStoreContext } from '../../utils/Globalstate.js';
import { ADD_TO_CART, UPDATE_CART_QUANTITY } from '../../utils/actions';

function ProductItem(item) {
  const {
    image,
    name,
    _id,
    price,
    quantity
  } = item;

  const [state, dispatch] = useStoreContext();

  // take the cart object from the global state so that
  // we dont have to keep writing state.cart through the code
  const { cart } = state;

  const addToCart = () => {
    // find the item object in global store by comparing the id of every item in the cart
    // to the id of the item we are wanting to add.
    const itemInCart = cart.find((cartItem) => cartItem._id === _id);


    // if there was a match and If that item is already in the cart we
    // call the UPDATE_CART_QUANTITY action to increase that item's
    // quantity within the cart instead of just readding the same item again.
    // Navigate to the homepage in the browser and click "Add to cart" several 
    // times for the same item. The shopping cart should no longer display duplicate 
    // entries. Instead, the value of the quantity input (abbreviated as "qty") will 
    // increment by one on each click.
    if (itemInCart) {
      console.log(itemInCart);
      console.log('ID: ' + _id);
      dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: _id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
    } else {
      dispatch({
        type: ADD_TO_CART,
        product: { ...item, purchaseQuantity: 1 }
      });
    }
  };

  return (
    <div className="card px-1 py-1">
      <Link to={`/products/${_id}`}>
        <img
          alt={name}
          src={`/images/${image}`}
        />
        <p>{name}</p>
      </Link>
      <div>
        <div>{quantity} {pluralize("item", quantity)} in stock</div>
        <span>${price}</span>
      </div>
      <button onClick={addToCart}>Add to cart</button>
    </div>
  );
}

export default ProductItem;
