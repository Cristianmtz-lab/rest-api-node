import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: 'Nelly777.*',
  database: 'moviesdb'
}

const connection = await mysql.createConnection(config)

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      const LowerCaseGenre = genre.toLowerCase()

      // get genre ids from database table using genre names
      const [genres] = await connection.query(
        'SELECT id, name FROM genre WHERE LOWER(name) = ?;', [LowerCaseGenre]
      )

      // no genre found
      if (genres.length === 0) return []

      // get the id from the first genre result
      const [{ id }] = genres

      // get all movies ids form database table
      // la query a movie_genres
      const [movieId] = await connection.query(
        'SELECT BIN_TO_UUID(movie_id) FROM movie_genres WHERE genre_id = ?;', [id]
      )

      // join
      const valuesId = movieId.map(movie => movie['BIN_TO_UUID(movie_id)'])
      const formatId = valuesId.map(value => `${value}`)
      // y devolver resultados..
      const [movies] = await connection.query(
        'SELECT title,  year, director, duration,  poster, rate, BIN_TO_UUID(id) FROM movie WHERE BIN_TO_UUID(id) IN (?);', [formatId]
      )

      return [movies]
    }

    const [movies] = await connection.query(
      'SELECT title,  year, director, duration,  poster, rate, BIN_TO_UUID(id) FROM movie;'
    )

    return movies
  }

  static async getById({ id }) {
    const [movies] = await connection.query(
      'SELECT title,  year, director, duration,  poster, rate, BIN_TO_UUID(id) FROM movie WHERE id = UUID_TO_BIN(?);', [id]
    )

    if (movies.length === 0) return null

    return movies[0]
  }

  static async create({ input }) {
    const {
      genre,
      title,
      year,
      director,
      duration,
      poster,
      rate
    } = input

    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
        [title, year, director, duration, poster, rate]
      )
    } catch (error) {
      // puede enviar info sensible
      throw new Error('Error creating movie')
      // enviar la treaza a  un servicio interno
      // sendlog(error)
    }

    const [movies] = await connection.query(
      'SELECT title,  year, director, duration,  poster, rate, BIN_TO_UUID(id) FROM movie WHERE id = UUID_TO_BIN(?);', [uuid]
    )

    const LowerCaseGenre = genre.map(item => item.toLowerCase())

    const [idsGenre] = await connection.query(
      'SELECT id FROM genre WHERE LOWER(name) IN (?);', [LowerCaseGenre]
    )

    const formatIdsGenre = idsGenre.map(item => item.id)

    const values = formatIdsGenre.map(() => '(UUID_TO_BIN(?), ? )').join(', ')

    const params = formatIdsGenre.flatMap(id => [uuid, id])

    console.log(params)

    try {
      await connection.query(
        `INSERT INTO movie_genres (movie_id, genre_id) VALUES ${values};`, params
      )
    } catch (error) {
      throw new Error('Relationship not createing')
    }

    return movies[0]
  }

  static async delete({ id }) {
    try {
      await connection.query(
        'DELETE FROM movie WHERE id = UUID_TO_BIN(?);', [id]
      )
    } catch (error) {
      throw new Error('Movie not found')
    }
  }

  static async update({ id, input }) {
    const fields = Object.entries(input).map(([key, value]) => `${key} = "${value}"`).join(', ')
    if (!fields.length > 0) return false

    console.log(fields)

    try {
      await connection.query(
        `UPDATE movie SET ${fields} WHERE id = UUID_TO_BIN(?);`, [id]
      )
    } catch (error) {
      throw new Error('Update not completed')
    }
  }
}
