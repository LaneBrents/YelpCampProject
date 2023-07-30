const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');


const campgrounds = require('./routes/campgrounds.js');
const reviews = require('./routes/reviews.js');


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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))


app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)



app.get('/', (req, res) => {
    res.render('home')
});




// Catch-all error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// Cath-all error
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})