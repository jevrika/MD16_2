import express, { Request, Response } from 'express';
const cors = require('cors');
const bodyParser = require('body-parser');
import { connection } from './db';
import { ZodError, ZodType, z } from 'zod';
import { error, log } from 'console';
const app = express();
const port = 3000;
app.use(bodyParser.json());

type Book = {
  id: number | string;
  name: string;
  author: string;
  genre: string;
  year: number;
};

app.use(
  cors({
    origin: '*',
  })
);

app.get('/books', async (req: Request<{}, {}, Book>, res) => {
  connection.query('SELECT * FROM books', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

app.get('/books/:id', async (req: Request< { id: string } ,{}, {}, Book>, res) => {
  connection.query(`SELECT * FROM books WHERE id = '${req.params.id}'`, (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});


app.delete('/books/:id', async (req: Request<{ id: string }, {}, {}>, res) => {
  connection.query(`DELETE FROM books WHERE id = '${req.params.id}'`, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

app.post('/books', async (req, res) => {
  const { name, author, genre, year } = req.body;
  console.log(req.body);

  const FormData = z.object({
    name: z.string().min(2, { message: 'Name must be 2 or more characters long' }).max(255, { message: 'Name must be 255 or less characters long' }).refine((val) => val.match(/^[A-Ža-ž]/g), {message: "Name must contain at least 2 letters"}),
    author: z.string().min(2, { message: 'Author must be 2 or more characters long' }).max(255, { message: 'Author must be 255 or less characters long' }),
    genre: z.string().min(2, { message: 'Genre must be 2 or more characters long' }).max(255, { message: 'Genre must be 255 or less characters long' }),
    year: z.coerce.number().gte(1800, { message: 'Year must be greater than or equal to 1800' }).lte(2050, { message: 'Year must be less than or equal to 2050' }),
  });

  if (!name || !author || !genre || !year) {
    res.status(400).json({
      error: {
        message: 'Please fill all form fields!',
      },
    });
    return;
  }

  const validationResult = FormData.safeParse(req.body);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map((error) => error.message);
    console.log(errorMessages);

    res.status(400).json({
      error: {
        message: errorMessages,
      },
    });

    return;
  }

  connection.query(
    `
    INSERT INTO books (name, author, genre, year)
    VALUES ('${name}', '${author}', '${genre}', '${year}')
  `,
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      res.json(results);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
