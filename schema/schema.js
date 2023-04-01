import { GraphQLSchema } from 'graphql'
import { RootQuery } from './rootQuery.js'

export default new GraphQLSchema({
  query: RootQuery,
})
