import React, { useEffect } from "react";
import { useMutation } from '@apollo/client';
import Jumbotron from '../components/Jumbotron'
import { ADD_ORDER } from "../utils/mutations";
import { idbPromise } from "../utils/helpers";

// see google docs, Global state, Stripe and IndexedDB in MERN,
// Create Success Component to Save Order in the Database
function Success() {

    const [addOrder] = useMutation(ADD_ORDER);

    useEffect(() => {
        async function saveOrder() {
            // declare a variable called cart that uses the idbPromise() function 
            // to get all of the cart items. Then declare a new variable called 
            // products that maps the cart items into an array of product IDs.
            const cart = await idbPromise('cart', 'get');
            const products = cart.map(item => item._id);

            // Once you have the product IDs, you can pass them to the addOrder() 
            // mutation. After the mutation executes, you can then delete all of 
            // the IDs from the IndexedDB store.
            if (products.length) {
                const { data } = await addOrder({ variables: { products } });
                const productData = data.addOrder.products;
              
                productData.forEach((item) => {
                    // set purchase quantity of item to 0 so that
                    // the delete case in the idbPromise() function will fully
                    // delete the item from indexedDB.
                  item.purchaseQuantity = 0;
                  idbPromise('cart', 'delete', item);
                });

                // The last step is to redirect the user to the homepage after three 
                // seconds. Use a setTimeout() function to accomplish this.
                setTimeout(() =>{
                    window.location.assign('/')
                }, 3000)
            }

        }

        saveOrder();
    }, [addOrder]);

    return (
      <div>
        <Jumbotron>
          <h1>Success!</h1>
          <h2>
            Thank you for your purchase!
          </h2>
          <h2>
            You will now be redirected to the homepage
          </h2>
        </Jumbotron>
      </div>
    );
};

export default Success;