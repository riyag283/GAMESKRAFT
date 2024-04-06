const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Location {
    coordinates: [Float!]
  }

  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    blockedIds: [ID!]
    location: Location
  }

  type Query {
    getUser(id: ID!): User
    getUsers(id: ID!): [User]
    getNearbyUsers(id: ID!): [User]
    getAllUsers: [User]
    getBlockedUsers(id: ID!): [User]
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!, lat: Float!, lng: Float!): User
    updateUser(id: ID!, name: String, email: String, password: String, lat: Float, lng: Float): User
    deleteUser(id: ID!): User
    blockUser(id: ID!, blockId: ID!): User
    unblockUser(id: ID!, blockId: ID!): User
  }
`);

module.exports = schema;
