const { AuthenticationError } = require('apollo-server-express');
const { User, Product, Category, Order } = require('../models');
const { signToken } = require('../utils/auth');

// see Global state, Stripe and IndexedDB in MERN, Create a GraphQL 
// Query to Generate a Stripe Session.
// We're using another test key copied from the Stripe documentation. Because 
// it's only a test key, it's fine to include it directly in the JavaScript file. 
// Once you create a real Stripe account, however, you would want to replace 
// this with an environment variable (e.g., process.env.STRIPE_KEY).
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

const resolvers = {
  Query: {
    categories: async () => {
      return await Category.find();
    },
    products: async (parent, { category, name }) => {
      const params = {};

      if (category) {
        params.category = category;
      }

      if (name) {
        params.name = {
          $regex: name
        };
      }

      return await Product.find(params).populate('category');
    },
    product: async (parent, { _id }) => {
      return await Product.findById(_id).populate('category');
    },
    user: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id).populate({
          path: 'orders.products',
          populate: 'category'
        });

        user.orders.sort((a, b) => b.purchaseDate - a.purchaseDate);

        return user;
      }

      throw new AuthenticationError('Not logged in');
    },
    // see Global state, Stripe and IndexedDB in MERN, Create a GraphQL 
    // Query to Generate a Stripe Session.
    checkout: async (parent, args, context) => {
      // When testing locally, it would be nice if the redirect URLs after a successful checkout 
      // pointed to localhost. When used in production, the redirect URLs should point to the 
      // deployed website. How would you know which URL to use? You can read the referring 
      // URL from the HTTP headers! Every HTTP request includes headers that provide additional 
      // information about the request being made.
      // By default, GraphQL resolvers don't have access to header information. The 
      // ApolloServer, however, can be configured to provide a context. One use for 
      // context is to preserve the headers from the original request, which the Shop-Shop 
      // app already does for you.
      // To parse out the referring URL, add the following line to the top of the 
      // checkout() resolver method.
      // This will give us the base domain that the request came from. Locally, that would be 
      // http://localhost:3001, since the GraphQL Apollo Studio Explorer is 
      // running on port 3001.
      const url = new URL(context.headers.referer).origin;
      // Remember, the checkout() query expects an array of product IDs. We'll 
      // pass this array into a new instance of an Order Mongoose model. The Order 
      // model will make it much easier to convert these IDs into fully populated 
      // product objects.
      const order = new Order({ products: args.products });
      const { products } = await order.populate('products').execPopulate();

      let line_items = [];

      // This loops over the products from the Order model and generates a 
      // price ID for each one through the Stripe API and pushes it into a new line_items 
      // array. 
      for (let i = 0; i < products.length; i++) {
        // generate product id
        const product = await stripe.products.create({
          name: products[i].name,
          description: products[i].description,
          // Because we have access to the referring URL from the variable above, we can also 
          // provide an image thumbnail when creating the product ID.
          // These image thumbnails won't display on the Stripe checkout page when testing 
          // locally, because Stripe can't download images that are being served from your 
          // personal computer's localhost. You will only see these images when you 
          // deploy the app to Heroku.
          images: [`${url}/images/${products[i].image}`]
        });
        
        // generate price id using the product id
        const price = await stripe.prices.create({
          product: product.id,
          // Note that we need to multiply the price by 100, because Stripe 
          // stores prices in cents, not dollars.
          unit_amount: products[i].price * 100,
          currency: 'usd',
        });

        // add price id to the line items array
        line_items.push({
          price: price.id,
          quantity: 1
        });
      }

      

      // This will use the line_items array to generate a Stripe checkout session. 
      // The checkout session ID is the only data the resolver needs, so 
      // we can then return it.
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        // Update the session variable to use the new url retrieved from the context header 
        // instead of example.com (see url variable for more comments)
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/`
      });
      
      return { session: session.id };

    },
    order: async (parent, { _id }, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id).populate({
          path: 'orders.products',
          populate: 'category'
        });

        return user.orders.id(_id);
      }

      throw new AuthenticationError('Not logged in');
    }
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    addOrder: async (parent, { products }, context) => {
      console.log(context);
      if (context.user) {
        const order = new Order({ products });

        await User.findByIdAndUpdate(context.user._id, { $push: { orders: order } });

        return order;
      }

      throw new AuthenticationError('Not logged in');
    },
    updateUser: async (parent, args, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(context.user._id, args, { new: true });
      }

      throw new AuthenticationError('Not logged in');
    },
    updateProduct: async (parent, { _id, quantity }) => {
      const decrement = Math.abs(quantity) * -1;

      return await Product.findByIdAndUpdate(_id, { $inc: { quantity: decrement } }, { new: true });
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    }
  }
};

module.exports = resolvers;
