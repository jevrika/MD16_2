import express, { Request, Response } from 'express';
const cors = require('cors');
const bodyParser = require('body-parser');
import { connection } from './db';
const app = express();
const port = 3000;
app.use(bodyParser.json());

type Book = {
  title: string;
  genre: string;
  rating: number;
  release_year: number;
  director: string;
  comments: string;
  budget: number;
};

app.use(
  cors({
    origin: '*',
  })
);

app.get('/movies', async (req: Request<{}, {}, Book>, res) => {
  connection.query('SELECT * FROM movies', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

app.get('/movies/:id', async (req: Request<{ id: string }, {}, {}, Book>, res) => {
  connection.query(`SELECT * FROM movies WHERE id = '${req.params.id}'`, (error, results) => {
    const resultstest: any = results;
    if (resultstest.length === 0) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

app.delete('/movies/:id', async (req: Request<{ id: string }, {}, {}>, res) => {
  connection.query(`DELETE FROM movies WHERE id = '${req.params.id}'`, (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

app.put('/movies/:id', async (req, res) => {
  const { comments } = req.body;

  const id = parseInt(req.params.id);
  console.log('id', id);

  if (!comments || !id) {
    res.status(400).json({
      error: {
        message: 'Some data are missing!',
      },
    });
    return;
  }

  connection.query(
    `
    UPDATE movies 
    SET comments = '${comments}'
    WHERE id = ${id}
  `,
    [id, comments],
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
