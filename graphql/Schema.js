const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Game {
    id: ID!
    name: String!
  }

  type GameInfo {
    game: ID!
    skillScore: Float!
    interestLevel: Float!
  }

  type Location {
    coordinates: [Float!]
  }

  type User {
    id: ID!
    username: String!
    password: String!
    blockedIds: [ID!]
    location: Location
    gameInterest: [GameInfo!]
  }

  type Query {
    getUser(id: ID!): User
    getUsers(id: ID!): [User]
    getUsersList(id: ID!): [User]
    getNearbyUsers(id: ID!): [User]
    getAllUsers: [User]
    getBlockedUsers(id: ID!): [User]
  }

  input GameInfoInput {
    game: ID!
    skillScore: Float!
    interestLevel: Float!
  }
  
  type Mutation {
    createGame(id: ID!, name: String!): Game!
    createUser(id: ID!, username: String!, password: String!, lat: Float!, lng: Float!, gameInterest: [GameInfoInput!]): User
    updateUser(id: ID!, name: String, email: String, password: String, lat: Float, lng: Float): User
    deleteUser(id: ID!): User
    blockUser(id: ID!, blockId: ID!): User
    unblockUser(id: ID!, blockId: ID!): User
  }
`);

module.exports = schema;
