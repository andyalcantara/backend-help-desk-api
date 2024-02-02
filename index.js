const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const Ticket = require('./src/models/ticket');

// Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/images', express.static('images'));

const PORT = process.env.PORT || 3000;

// Mongoose setup
mongoose.connect('mongodb+srv://andyalcantara745:pPfZufZRYmxosUer@zealthy-db.2zkmgj2.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const mongoConnection = mongoose.connection;

mongoConnection.once('open', () => {
  console.log('Database connection established');
});

// Multer setup
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './images');
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });
const singleUpload = upload.single('file');
// Endpoints
app.get('/', (req, res) => {
  res.json('Hello World');
});

app.post('/tickets', (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err) return next(err);

    if (!req.file) {
      return res.status(400).json({message: 'No file uploaded'});
    }
    Ticket.findOne({email: req.body.email}, (err, ticket) => {
      if (err) return next(err);

      if (!ticket) {
        const ticket = new Ticket({
          name: req.body.name,
          email: req.body.email,
          description: req.body.description,
          file: req.file?.path,
          ticketStatus: 'New',
          comments: []
        });
    
        ticket.save((err, ticket) => {
          if (err) return next(err);
    

          return res.status(200).json(ticket);
        });
      } else {
        return res.status(400).json({
          message: 'An email already exits, please update your email'
        })
      }
    });
  });
});

app.get('/tickets', (req, res, next) => {
  // Get all Tickets
  Ticket.find((err, tickets) => {
    if (err) return next(err);
    res.status(200).json(tickets);
  });
});

app.patch('/tickets/:id', (req, res, next) => {
  // Update ticket with new, in progress, resolved
  const docId = req.params.id;
  const {value} = req.body;

  Ticket.findById(docId, (err, ticket) => {
    if (err) return next(err);

    ticket.ticketStatus = value;
    ticket.save((err, ticket) => {
      if (err) return next(err);

      res.status(200).json(ticket);
    });
  });
});

app.patch('/tickets/:id/comment', (req, res, next) => {
  const docId = req.params.id;
  const newComment = req.body.comment;

  Ticket.findById(docId, (err, ticket) => {
    if (err) return next(err);

    ticket.comments.push(newComment);
    ticket.save();

    res.status(200).json(ticket);
  });
});

app.listen(PORT, () => {
  console.log('Service listening on port 3000');
});
