import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();

app.use(express.json());
app.use(cors());

app.post('/signup', (req, res) => {
    if (!req.body) {
        res.sendStatus(400);
    }
    const { name, email, password } = req.body;
});

app.listen(4000, () => {
    console.log('Server is running!');
});
