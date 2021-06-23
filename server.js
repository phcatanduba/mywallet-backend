import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pg from 'pg';
import { v4 } from 'uuid';

const app = express();

app.use(express.json());
app.use(cors());
const { Pool } = pg;
const connection = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'mywallet',
});

/*------------------ SIGN-UP-----------------*/

app.post('/sign-up', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.sendStatus(400);
    } else {
        try {
            const request = await connection.query(
                'SELECT * FROM customers WHERE name = $1',
                [name]
            );
            const hasCustomer = request.rows.length;
            if (hasCustomer) {
                res.sendStatus(409);
            } else {
                const hash = bcrypt.hashSync(password, 10);
                await connection.query(
                    'INSERT INTO customers (name, email, password) VALUES ($1, $2, $3)',
                    [name, email, hash]
                );
                res.sendStatus(201);
            }
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    }
});

/*------------------ SIGN-IN-----------------*/

app.get('/sign-in', async (req, res) => {
    const { email, password, id } = req.body;
    if (!email || !password || !id) {
        res.sendStatus(400);
    } else {
        try {
            const request = await connection.query(
                'SELECT * FROM customers WHERE email = $1',
                [email]
            );
            const customer = request.rows[0];
            if (customer && bcrypt.compareSync(password, customer.password)) {
                const token = v4();
                await connection.query(
                    `
              INSERT INTO sessions ("customerId", token)
              VALUES ($1, $2)
            `,
                    [customer.id, token]
                );

                res.send(token);
            } else {
                res.sendStatus(400);
            }
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    }
});

/*------------------ LOGOUT-----------------*/

app.post('/logout', async (req, res) => {
    const authorization = req.headers.authorization;
    const token = authorization?.replace('Bearer ', '');
    try {
        if (token) {
            await connection.query('DELETE FROM sessions WHERE token = $1', [
                token,
            ]);
            res.sendStatus(201);
        } else {
            res.sendStatus(401);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.listen(4000, () => {
    console.log('Server is running!');
});
