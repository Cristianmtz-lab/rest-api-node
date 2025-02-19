import movies from '../../movies.json' with { type: 'json' }
import { randomUUID } from 'node:crypto'

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      return movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
    }
    return movies
  }

  static async getById({ id }) {
    const movie = movies.find(movie => movie.id === id)
    return movie
  }

  static async create({ input }) {
    // en base de datos
    const newMovie = {
      id: randomUUID(), // uuid v4
      ...input
    }

    // Esto ya no seria una estructura REST porque estamos guardando
    // el estado de la aplicacion en memoria
    movies.push(newMovie)

    return newMovie
  }

  static async delete({ id }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) return false

    movies.splice(movieIndex, 1)

    return true
  }

  static async update({ id, input }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) return false

    const updateMovie = {
      ...movies[movieIndex],
      ...input
    }

    return updateMovie
  }
}
