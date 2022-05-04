import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';

// see CategoryMenu/index.js
import { useStoreContext } from '../../utils/Globalstate.js';
import { UPDATE_PRODUCTS } from '../../utils/actions';

import ProductItem from '../ProductItem';
import { QUERY_PRODUCTS } from '../../utils/queries';
import spinner from '../../assets/spinner.gif';

// function to start index db database connection and read write privelages
import { idbPromise } from "../../utils/helpers";

function ProductList() {
  // Again, we immediately execute the useStoreContext() function to retrieve 
  // the current global state object and the dipatch() method to update state.
  const [state, dispatch] = useStoreContext();

  // We then destructure the currentCategory data out of the state object so 
  // we can use it in the filterProducts() function.
  const { currentCategory } = state;

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  // We then implement the useEffect() Hook in order to wait for our useQuery() 
  // response to come in. Once the data object returned from useQuery() goes from 
  // undefined to having an actual value, we execute our dispatch() function, 
  // instructing our reducer function that it's the UPDATE_PRODUCTS action and it 
  // should save the array of product data to our global store. When that's done, 
  // useStoreContext() executes again, giving us the product data needed display products 
  // to the page.
  useEffect(() => {
    // if there's data to be stored
    if (data) {
      // let's store it in the global state object
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products
      });
  
      // but let's also take each product and save it to IndexedDB using the helper function.
      // We set it up so that when we save product data from the useQuery() Hook's response 
      // to the global state object with the dispatch() method, we also save each file to 
      // the products object store in IndexedDB using the idbPromise() function. 
      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });
    }
    // Let's set it up so that if the useQuery() Hook isn't establishing a connection to the 
    // GraphQL server, we'll use the data stored in IndexedDB instead.
    // if there is data coming from the Mongo server, use it. else if there in no
    // loading and there is no data, use the product objects stored in indexDB.
    // If we're offline and we run the useQuery() Hook, we'll never be in a state of 
    // loading data. This means that the loading response Apollo provides to indicate 
    // that we're still waiting for a response won't exist, because we're no longer 
    // waiting for data. The data simply isn't coming.
    else if (!loading) {
      // since we're offline we'll run idbPromise() to get all of the data from the products 
      // store and use the returning array of product data to update the global store.
      idbPromise('products', 'get').then((products) => {
        // use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products
        });
      });
    }
  }, [data, loading, dispatch]);

  function filterProducts() {
    if (!currentCategory) {
      return state.products;
    }

    return state.products.filter(product => product.category._id === currentCategory);
  }

  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {state.products.length ? (
        <div className="flex-row">
          {filterProducts().map((product) => (
            <ProductItem
              key={product._id}
              _id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      {loading ? <img src={spinner} alt="loading" /> : null}
    </div>
  );
}

export default ProductList;
