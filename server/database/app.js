import express, { raw } from 'express';
import { connect } from 'mongoose';
import { readFileSync } from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';

import Reviews from './review.js';
import Dealerships from './dealership.js';

const app = express()
const port = 3030;

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));

const reviews_data = JSON.parse(readFileSync("./data/reviews.json", 'utf8'));
const dealerships_data = JSON.parse(readFileSync("./data/dealerships.json", 'utf8'));

// Use environment variable for MongoDB URI
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/dealershipsDB";
connect(mongoURI);

try {
  await Reviews.deleteMany({});
  await Reviews.insertMany(reviews_data['reviews']);

  await Dealerships.deleteMany({});
  await Dealerships.insertMany(dealerships_data['dealerships']);

  console.log('Database seeded successfully');

} catch (error) {
  console.log('Error seeding database', error);
}


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({state: req.params.state});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const documents = await Dealerships.find({id: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

//Express route to insert review
app.post('/insert_review', raw({ type: '*/*' }), async (req, res) => {
  data = JSON.parse(req.body);
  const lastReview = await Reviews.findOne().sort( { id: -1 } )
  let new_id = lastReview ? lastReview.id + 1 : 1;

  const review = new Reviews({
    "id": new_id,
    "name": data['name'],
    "dealership": data['dealership'],
    "review": data['review'],
    "purchase": data['purchase'],
    "purchase_date": data['purchase_date'],
    "car_make": data['car_make'],
    "car_model": data['car_model'],
    "car_year": data['car_year'],
  });

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
