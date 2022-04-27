// see google docs redux and stripe in MERN, Refactor Components to Use Global State

// Now, we still don't actually have any data in state yet. We need to somehow take the 
// categoryData that returns from the useQuery() Hook and use the dispatch() method 
// to set our global state. How can we do that if useQuery() is an asynchronous 
// function? We can't simply just add the dispatch() method below it, as categoryData 
// won't exist on load!
// Instead, we need to use the React useEffect() Hook, which was created 
// specifically for times like this.
import React, { useEffect } from 'react';
import { UPDATE_CATEGORIES, UPDATE_CURRENT_CATEGORY } from '../../utils/actions';
import { useQuery } from '@apollo/client';
import { QUERY_CATEGORIES } from '../../utils/queries';
// The last thing we need to do is create the custom function using the 
// useContext() Hook to be used by the components that actually need the data 
// our <StoreProvider> will be, well . . . providing!
// We just created our own custom React Hook! When we execute this function 
// from within a component, we will receive the [state, dispatch] data our 
// StoreProvider provider manages for us. This means that any component that 
// has access to our StoreProvider component can use any data in our global state 
// container or update it using the dispatch function.
import { useStoreContext } from "../../utils/Globalstate.js";

function CategoryMenu() {

  // Since we will want to add offline capabilities later, we'll query our 
  // category data using the useQuery() hook from Apollo, store it into the global 
  // state object, and then use the category data from the global state object 
  // to use it in the UI instead.
  // Now when we use this component, we immediately call upon the useStoreContext() 
  // Hook to retrieve the current state from the global state object and the 
  // dispatch() method to update state.
  const [state, dispatch] = useStoreContext();

  // Because we only need the categories array out of our global state, we simply 
  // destructure it out of state so we can use it to provide to our returning JSX.
  const { categories } = state;

  // query to get the categories data from database
  const { data: categoryData } = useQuery(QUERY_CATEGORIES);

  // see useEffect import statement for more comments.
  // Now when this component loads and the response from the useQuery() Hook returns, 
  // the useEffect() Hook notices that categoryData is not undefined anymore and runs 
  // the dispatch() function, setting our category data to the global state!
  // Remember how the useEffect() Hook works. It is a function that takes two arguments, 
  // a function to run given a certain condition, and then the condition. In this case, 
  // the function runs immediately on load and passes in our function to update the 
  // global state and then the data that we're dependent on, categoryData and dispatch. 
  // Now, categoryData is going to be undefined on load because the useQuery() Hook 
  // isn't done with its request just yet, meaning that if statement will not run.
  // But the beauty of the useEffect() Hook is that it not only runs on component load, 
  // but also when some form of state changes in that component. So when useQuery() 
  // finishes, and we have data in categoryData, the useEffect() Hook runs again 
  // and notices that categoryData exists! Because of that, it does its job and executes 
  // the dispatch() function.
  useEffect(() => {
    // if categoryData exists or has changed from the response of useQuery, then run dispatch()
    if (categoryData) {
      // execute our dispatch function to change the categories in the
      // global state.
      dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories
      });
    }
  }, [categoryData, dispatch]);

  const handleClick = id => {
    dispatch({
      type: UPDATE_CURRENT_CATEGORY,
      currentCategory: id
    });
  };


  // creates buttons from the global state that can change the current category in 
  // the global state.
  // Now when we retrieve our category content from the server, we immediately save 
  // it to our global state object and use that data to print the list of 
  // categories to the page.
  // We also set it up where when we click one of those categories, we save that 
  // category's _id value to the global state as well!
  return (
    <div>
      <h2>Choose a Category:</h2>
      {categories.map(item => (
        <button
          key={item._id}
          onClick={() => {
            handleClick(item._id);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryMenu;
