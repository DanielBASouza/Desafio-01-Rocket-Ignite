import { buildRoutePath } from "./utils/build-route-path.js";
import { randomUUID } from 'node:crypto'
import { Database } from "./database.js";

const database = new Database()

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body

            if (!title) {
                return res.writeHead(400).end(JSON.stringify({ message: "Titulo não pode ser vazio" }))
            }

            if (!description) {
                return res.writeHead(400).end(JSON.stringify({ message: "Descrição não pode ser vazia" }))
            }

            const data = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date()
            }


            database.insert('tasks', data)

            return res.writeHead(201).end()
        }
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const task = database.select('tasks', {
                title: search,
                description: search
            })

            res.writeHead(200).end(JSON.stringify(task))
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            if (!title && !description) {
                return res.writeHead(404).end(JSON.stringify({ message: 'Title or Description are required' }))
            }

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }

            database.update('tasks', id, {
                title,
                description,
                updated_at: new Date()
            })

            res.writeHead(204).end(JSON.stringify(task))
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }

            database.delete('tasks', id)

            res.writeHead(204).end(JSON.stringify(task))
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end()
            }

            const isTaskCompleted = !!task.completed_at

            const completed_at = isTaskCompleted ? null : new Date()
            database.update('tasks', id, {
                completed_at
            })

            res.writeHead(204).end(JSON.stringify(task))
        }
    }
]