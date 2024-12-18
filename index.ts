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
    likedby: [ID!]
    authorid: ID!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    profilePicture: String
    followers: [ID!]
    following: [ID!]
    bio: String!
  }

  type Query {
    posts: [Post!]!
    users: [User!]!
  }

  type Mutation {
    addPost(content: String!, author: String!, mentions: [String!], image: String!, profilePicture: String!, likes: Int!, likedby: [ID!], authorid: ID!): Post!
    signUp(username: String!, email: String!, profilePicture: String!, followers: [ID!], following: [ID!], bio: String!): User!
    likePost(postId: ID!, userId: ID!): Post!
    followUser(followerId: ID!, followeeId: ID!): User!
    deletePost(id: ID!): Post!
  }
`;

// Mock data
let posts = [
  { id: "1", content: "Hello World!", author: "John Doe", mentions: [], image: "", profilePicture: "https://cdn-icons-png.flaticon.com/512/149/149071.png", likes: 0, likedby: [], authorid: "1" },
];

let users = [
  { id: "1", username: "john_doe", email: "john.doe@example.com", profilePicture: "https://cdn-icons-png.flaticon.com/512/149/149071.png", followers: [], following: [], bio: "Socially awkward" },
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
    addPost: (_, { content, author, mentions, image, profilePicture, likes, likedby, authorid }) => {
      const newPost = { id: String(posts.length + 1), content, author, mentions, image, profilePicture, likes:0, likedby:[], authorid };
      posts.unshift(newPost);
      return newPost;
    },
    signUp: (_, { username, email, profilePicture, followers, following, bio }) => {
      const newUser = { id: String(users.length + 1), username, email, profilePicture, followers: [], following: [], bio };
      users.push(newUser);
      return newUser;
    },
    deletePost: (_, { id }) => {
      const postIndex = posts.findIndex((post) => post.id === id);
      if (postIndex === -1) {
        throw new Error("Post not found");
      }
      
      // Remove the post from the array and return it
      const deletedPost = posts.splice(postIndex, 1)[0];
      return deletedPost;
    }, 
    likePost: (_, { postId, userId }) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) throw new Error("Post not found");
    
      // Check if the user has already liked the post
      if (!post.likedby.includes(userId)) {
        post.likes += 1; // Increment the likes count
        post.likedby.push(userId); // Add the user ID to the likedby array
      } else {
        post.likes -= 1; // Decrement the likes count
        post.likedby = post.likedby.filter((id) => id !== userId); // Remove the user ID from the likedby array
      }
    
      return post;
    },
    followUser: (_, { followerId, followeeId }) => {
      const follower = users.find((user) => user.id === followerId);
      const followee = users.find((user) => user.id === followeeId);
    
      if (!follower || !followee) {
        throw new Error("User not found");
      }
    
      // Add the followeeId to the follower's following array if not already there
      if (!follower.following.includes(followeeId)) {
        follower.following.push(followeeId);
        followee.followers.push(followerId);
      }
      else {
        follower.following = follower.following.filter((id) => id !== followeeId);
      }
    
      // Return the entire updated follower user
      return follower;
    },
    
  },
};

// Create the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
