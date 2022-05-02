import React from 'react';
import { useStoreContext } from '../../utils/Globalstate.js';
import { REMOVE_FROM_CART, UPDATE_CART_QUANTITY } from '../../utils/actions';

const CartItem = ({ item }) => {
  // Note that we only destructured the dispatch() function from the 
  // useStoreContext Hook, because the CartItem component has no need to read state.
  // This is because the cartItem information from the state gets passed down
  // from the Cart component as a prop already.
  // We only want to be able to change values within the state.
  const [, dispatch] = useStoreContext();

  const removeFromCart = item => {
    dispatch({
      type: REMOVE_FROM_CART,
      _id: item._id,
      purchaseQuantity: parseInt(item.purchaseQuantity) - 1
    });
  };

  // when a user manually enters a quantity for an item into
  // the input bar.
  const onChange = (e) => {
    const value = e.target.value;
  
    if (value === '0') {
      dispatch({
        type: REMOVE_FROM_CART,
        _id: item._id,
        purchaseQuantity: parseInt(item.purchaseQuantity) - 1
      });
    } else {
      dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: item._id,
        purchaseQuantity: parseInt(value)
      });
    }
  };

  return (
    <div className="flex-row">
      <div>
        <img
          src={`/images/${item.image}`}
          alt=""
        />
      </div>
      <div>
        <div>{item.name}, ${item.price}</div>
        <div>
          <span>Qty:</span>
          <input
            type="number"
            placeholder="1"
            value={item.purchaseQuantity}
            onChange={onChange}
          />
          <span
            role="img"
            aria-label="trash"
            onClick={() => removeFromCart(item)}
          >
            🗑️
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartItem;