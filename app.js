import express, { json } from 'express'

import { createMovieRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

export const createApp = ({ movieModel }) => {
  const app = express()
  app.disable('x-powered-by')

  app.use(json())
  app.use(corsMiddleware())

  // metodos normales: GET/HEAD/POST
  // metodos complejos: PUT/PATCH/DELETE

  // CORS PRE-Flight
  // OPTIONS

  app.use('/movies', createMovieRouter({ movieModel }))

  const PORT = process.env.PORT ?? 3000

  app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
  })
}
