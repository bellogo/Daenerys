const db = require('../utilities/mysql_db')

class Repo {
  static async get_resource (model, id) {
    const queryString = `SELECT * FROM ${model} WHERE id = ?`
    const result = await db.query(queryString, [id])
    return result[0][0]
  }

  static async get_resource_by_name (model, name) {
    const queryString = `SELECT * FROM ${model} WHERE name = ?`
    const result = await db.query(queryString, [name])
    return result[0][0]
  }

  static async delete_resource (model, id) {
    const queryString = `DELETE FROM ${model} WHERE id = ?`
    const result = await db.query(queryString, [id])
    return result[0][0]
  }

  static async get_all_resources (model) {
    const queryString = `SELECT * FROM ${model}`
    const result = await db.query(queryString)
    return result[0]
  }

  static async add_resource (model, coloumns, values) {
    const valueCount = values.length
    let value = '?,'
    const newString = value.repeat(valueCount)
    value = newString.slice(0, -1)
    const queryString = `INSERT INTO ${model}(${coloumns}) VALUES (${value});`
    const result = await db.query(queryString, values)
    return result[0]
  }

  static async update_resource (model, coloumns, values, id) {
    const queryString = `UPDATE ${model} SET ${coloumns} WHERE id = ?`
    values.push(id)
    const result = await db.query(queryString, values)
    return result[0]
  }

  static async get_model_relationship (model, id, relationship_model) {
    const queryString = `SELECT ${model}.*, ${relationship_model}.name, ${relationship_model}.slug, 
                        ${relationship_model}.base_fare, ${relationship_model}.bus_stop_range FROM ${model} 
                        INNER JOIN ${relationship_model}
                        ON ${model}.route_id = ${relationship_model}.id  WHERE ${model}.id = ?`
    const result = await db.query(queryString, [id])
    return result[0][0]
  }
}

module.exports = Repo
