import { GraphQLObjectType, GraphQLString } from 'graphql'

export const WorkSpaceType = new GraphQLObjectType({
  name: 'Workspace',
  fields: () => ({
    name: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    members: { type: GraphQLString },
  }),
})
