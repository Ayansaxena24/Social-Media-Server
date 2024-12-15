const { ApolloServer, gql } = require('apollo-server');

// Define your GraphQL schema (type definitions)
const typeDefs = gql`
  type Post {
    id: ID!
    content: String!
    author: String!
    mentions: [String!]
    image: String
    profilePicture: String!
    likes: Int!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    profilePicture: String
  }

  type Query {
    posts: [Post!]!
    users: [User!]!
  }

  type Mutation {
    addPost(content: String!, author: String!, mentions: [String!], image: String!, profilePicture: String!, likes: Int!): Post!
    signUp(username: String!, email: String!, profilePicture: String!): User!
    likePost(postId: ID!): Post!
  }
`;

// Mock data
let posts = [
  { id: "1", content: "Hello World!", author: "John Doe", mentions: [], image: "", profilePicture: "", likes: 0 },
];

let users = [
  { id: "1", username: "john_doe", email: "john.doe@example.com", profilePicture: "" },
];

// Define resolvers
const resolvers = {
  Query: {
    posts: () => posts,
    users: () => users,
  },
  Post: {
    likes: (parent) => {
        return parent.likes !== undefined ? parent.likes : 0;
    },
},
  Mutation: {
    addPost: (_, { content, author, mentions, image, profilePicture, likes }) => {
      const newPost = { id: String(posts.length + 1), content, author, mentions, image, profilePicture, likes:0 };
      posts.push(newPost);
      return newPost;
    },
    signUp: (_, { username, email, profilePicture }) => {
      const newUser = { id: String(users.length + 1), username, email, profilePicture };
      users.push(newUser);
      return newUser;
    },
    likePost: (_, { postId }) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) throw new Error("Post not found");
      post.likes += 1;
      return post;
    },
  },
};

// Create the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
