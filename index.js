"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_1 = require("apollo-server");
// Define the GraphQL schema (type definitions)
var typeDefs = (0, apollo_server_1.gql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  type User {\n    id: ID!\n    name: String!\n    followersCount: Int!\n    followingCount: Int!\n    following: [User!]\n    isFollowing: Boolean!\n  }\n\n  type Post {\n    id: ID!\n    content: String!\n    author: String!\n    isVisibleToCurrentUser: Boolean! # Whether the post is visible to the current user\n  }\n\n  type Mutation {\n    followUser(followerId: String!, followeeId: String!): User\n    unfollowUser(followerId: String!, followeeId: String!): User\n    signUpUser(name: String!, email: String!, password: String!): User!\n    addPost(content: String!, author: String!): Post!\n  }\n\n  type Query {\n    users(currentUserId: String!): [User!]! # Pass current user ID to filter follow/unfollow status\n    posts(currentUserId: String!): [Post!]! # Return posts visible to the current user\n  }\n"], ["\n  type User {\n    id: ID!\n    name: String!\n    followersCount: Int!\n    followingCount: Int!\n    following: [User!]\n    isFollowing: Boolean!\n  }\n\n  type Post {\n    id: ID!\n    content: String!\n    author: String!\n    isVisibleToCurrentUser: Boolean! # Whether the post is visible to the current user\n  }\n\n  type Mutation {\n    followUser(followerId: String!, followeeId: String!): User\n    unfollowUser(followerId: String!, followeeId: String!): User\n    signUpUser(name: String!, email: String!, password: String!): User!\n    addPost(content: String!, author: String!): Post!\n  }\n\n  type Query {\n    users(currentUserId: String!): [User!]! # Pass current user ID to filter follow/unfollow status\n    posts(currentUserId: String!): [Post!]! # Return posts visible to the current user\n  }\n"])));
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   followersCount: number;
//   followingCount: number;
//   following: User[]; // Correctly type following as an array of User objects
// }
// interface Post {
//   id: string;
//   content: string;
//   author: string;
// }
// Mock data
var users = [
    { id: "1", name: "John Doe", email: "john@example.com", followersCount: 0, followingCount: 0, following: [{ id: "2", name: "Jane Smith" }] },
    { id: "2", name: "Jane Smith", email: "jane@example.com", followersCount: 1, followingCount: 0, following: [] },
];
var posts = [
    { id: "1", content: "Hello World!", author: "1" },
    { id: "2", content: "My first post!", author: "2" },
];
// Define resolvers
var resolvers = {
    Query: {
        users: function (_, _a) {
            var currentUserId = _a.currentUserId;
            return users.map(function (user) {
                var isFollowing = user.following.some(function (followedUser) { return followedUser.id === currentUserId; });
                return __assign(__assign({}, user), { isFollowing: isFollowing });
            });
        },
        posts: function (_, _a) {
            var currentUserId = _a.currentUserId;
            try {
                return posts.map(function (post) {
                    var postAuthor = users.find(function (user) { return user.id === post.author; });
                    var isVisibleToCurrentUser = (postAuthor === null || postAuthor === void 0 ? void 0 : postAuthor.following.some(function (followedUser) { return followedUser.id === currentUserId; })) || false;
                    return __assign(__assign({}, post), { isVisibleToCurrentUser: isVisibleToCurrentUser });
                });
            }
            catch (error) {
                console.error("Error in posts resolver:", error);
                throw new Error("Failed to fetch posts");
            }
        }
    },
    Mutation: {
        followUser: function (_, _a) {
            var followerId = _a.followerId, followeeId = _a.followeeId;
            var followerIndex = users.findIndex(function (user) { return user.id === followerId; });
            var followeeIndex = users.findIndex(function (user) { return user.id === followeeId; });
            if (followerIndex === -1 || followeeIndex === -1) {
                throw new Error('User not found');
            }
            var follower = users[followerIndex];
            var followee = users[followeeIndex];
            if (!follower.following.some(function (user) { return user.id === followeeId; })) {
                users[followerIndex] = __assign(__assign({}, follower), { following: __spreadArray(__spreadArray([], follower.following, true), [followee], false), followingCount: follower.followingCount + 1 });
                users[followeeIndex] = __assign(__assign({}, followee), { followersCount: followee.followersCount + 1 });
            }
            return users[followeeIndex];
        },
        unfollowUser: function (_, _a) {
            var followerId = _a.followerId, followeeId = _a.followeeId;
            var follower = users.find(function (user) { return user.id === followerId; });
            var followee = users.find(function (user) { return user.id === followeeId; });
            if (!follower || !followee) {
                throw new Error('User not found');
            }
            var followeeIndex = follower.following.findIndex(function (user) { return user.id === followeeId; });
            if (followeeIndex !== -1) {
                follower.following.splice(followeeIndex, 1);
                follower.followingCount -= 1;
                followee.followersCount -= 1;
            }
            return followee;
        },
        signUpUser: function (_, _a) {
            var name = _a.name, email = _a.email, password = _a.password;
            var newUser = {
                id: (users.length + 1),
                name: name,
                email: email,
                followersCount: 0,
                followingCount: 0,
                following: [],
            };
            users.push(newUser);
            return newUser;
        },
        addPost: function (_, _a) {
            var content = _a.content, author = _a.author;
            var newPost = { id: (posts.length + 1), content: content, author: author };
            posts.push(newPost);
            return newPost;
        },
    },
};
// Create the Apollo Server
var server = new apollo_server_1.ApolloServer({ typeDefs: typeDefs, resolvers: resolvers });
// Start the server
server.listen().then(function (_a) {
    var url = _a.url;
    console.log("\uD83D\uDE80 Server ready at ".concat(url));
});
var templateObject_1;
