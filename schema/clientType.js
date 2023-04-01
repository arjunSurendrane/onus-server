import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

// client type
export const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    mobile: { type: GraphQLString },
    password: { type: GraphQLString },
    block: { type: GraphQLBoolean },
    plan: { type: GraphQLString },
  }),
})
