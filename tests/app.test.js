import { beforeAll } from '@jest/globals';
import supertest from 'supertest';
import app from '../app';
import connection from '../connection.js';

const token = 'teste';

beforeAll(async () => {
    try {
        await connection.query(
            'INSERT INTO sessions ("customerId", token) VALUES ($1, $2)',
            [30, token]
        );
    } catch (e) {
        console.log(e);
    }
});

afterAll(async () => {
    try {
        await connection.query('DELETE FROM sessions WHERE token = $1', [
            token,
        ]);
        await connection.query('DELETE FROM credits');
        await connection.query('DELETE FROM debits');
    } catch (e) {
        console.log(e);
    }
});

/*-----------------CREDIT----------------*/

describe('POST /credit', () => {
    it('returns status 401 for valid params without authorization', async () => {
        const body = {
            item: 'teste',
            credit: 100,
        };
        const result = await supertest(app).post('/credit').send(body);
        expect(result.status).toEqual(401);
    });
});

describe('POST /credit', () => {
    it('returns status 201 for valid params with authorization', async () => {
        const body = {
            item: 'teste',
            credit: 100,
        };

        const result = await supertest(app)
            .post('/credit')
            .send(body)
            .set({ Authorization: token });
        expect(result.status).toEqual(201);
    });
});

describe('POST /credit', () => {
    it('returns status 400 for invalid params', async () => {
        const body = {
            item: 'teste',
            credit: 'dasda',
        };

        const result = await supertest(app)
            .post('/credit')
            .send(body)
            .set({ Authorization: token });
        expect(result.status).toEqual(400);
    });
});

describe('POST /credit', () => {
    it('returns status 500 for credit is too big (not a integer)', async () => {
        const body = {
            item: 'teste',
            credit: 100000000000000,
        };

        const result = await supertest(app)
            .post('/credit')
            .send(body)
            .set({ Authorization: token });
        expect(result.status).toEqual(500);
    });
});

/*-----------------DEBIT----------------*/

describe('POST /debit', () => {
    it('returns status 401 for valid params without authorization', async () => {
        const body = {
            item: 'teste',
            debit: 100,
        };
        const result = await supertest(app)
            .post('/debit')
            .send(body)
            .set({ Authorization: 'asdasdasdjsdoijasdoi' });
        expect(result.status).toEqual(401);
    });
});

describe('POST /debit', () => {
    it('returns status 201 for valid params with authorization', async () => {
        const body = {
            item: 'teste',
            debit: 100,
        };

        const result = await supertest(app)
            .post('/debit')
            .send(body)
            .set({ Authorization: token });
        expect(result.status).toEqual(201);
    });
});

describe('POST /debit', () => {
    it('returns status 400 for invalid params', async () => {
        const body = {
            item: 'teste',
        };

        const result = await supertest(app)
            .post('/debit')
            .send(body)
            .set({ Authorization: token });
        expect(result.status).toEqual(400);
    });
});

describe('POST /debit', () => {
    it('returns status 500 for debit is too big (not a integer)', async () => {
        const body = {
            item: 'teste',
            debit: 100000000000,
        };

        const result = await supertest(app)
            .post('/debit')
            .send(body)
            .set({ Authorization: token });
        expect(result.status).toEqual(500);
    });
});

/*-----------------BALANCE----------------*/

describe('GET /balance', () => {
    it(' returns a object for valid authorization', async () => {
        const result = await supertest(app)
            .get('/balance')
            .set({ Authorization: token });
        expect(
            ('debit' in result.body[0] && 'item' in result.body[0]) ||
                ('credit' in result.body[0] && 'item' in result.body[0])
        ).toEqual(true);
    });
});

describe('GET /balance', () => {
    it('returns status 401 for a invalid authorization', async () => {
        const result = await supertest(app)
            .get('/balance')
            .set({ Authorization: '123123123' });
        expect(result.status).toEqual(401);
    });
});
