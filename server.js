import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pg from 'pg';

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

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.sendStatus(400);
    }
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
            connection.query(
                'INSERT INTO customers (name, email, password) VALUES ($1, $2, $3)',
                [name, email, hash]
            );
            res.sendStatus(201);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.listen(4000, () => {
    console.log('Server is running!');
});
