const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
const connectDB = require("./config/connection");
const schema = require("./graphql/Schema");
const resolvers = require("./graphql/Resolvers");

const app = express();
connectDB();

app.use(cors());

app.use(
  "/",
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/");
});
