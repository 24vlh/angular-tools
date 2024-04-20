import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors());

app.post('', (req: Request, res: Response): void => {
  console.log('POST', req.body);
  res.json({
    type: 'POST',
    formValue: req.body
  });
});

app.put('', (req: Request, res: Response): void => {
  console.log('PUT', req.body);
  res.json({
    type: 'PUT',
    formValue: req.body
  });
});

app.patch('', (req: Request, res: Response): void => {
  console.log('PATCH', req.body);
  res.json({
    type: 'PATCH',
    formValue: req.body
  });
});

app.post(
  '/upload',
  multer({ dest: 'uploads/' }).array('file'),
  (req: Request, res: Response): void => {
    console.log('UPLOAD', req.body);
    res.json({
      type: 'UPLOAD',
      formValue: req.body
    });
  }
);

const port: number = 80;
app.listen(port, (): void => {
  console.log(`Server is listening on port ${port}`);
});
