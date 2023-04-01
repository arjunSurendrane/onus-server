import { GraphQLID, GraphQLList, GraphQLObjectType } from 'graphql'
import User from '../models/userModel.js'
import { ClientType } from './clientType.js'

export const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    // find client
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id)
      },
    },
    // get client list
    clients: {
      type: new GraphQLList(ClientType),
      resolve(parent, args) {
        return User.find()
      },
    },
  },
})
