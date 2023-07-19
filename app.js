const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/YelpCampProject', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

// Logic to check if there is an error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.render('home')
});

//This renders the 'all campgrounds' page
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('Campgrounds/index', {campgrounds})
});

// This renders the new campground form page
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// This sends a POST request from the new campground form page
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

// This renders the campground info page
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
})