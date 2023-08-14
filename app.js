if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');


mongoose.connect('mongodb://localhost:27017/YelpCampProject', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
    // useFindAndModify: false
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
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

const sessionConfig = {
    secret: 'thisisnotagoodsecret',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //This will allow us to expire the session after 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //This middleware is required for persistent login sessions
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //How to store the user in the session
passport.deserializeUser(User.deserializeUser()); //How to un-store the user from the session



// Universal Flash middleware
app.use ((req, res, next) => {
    res.locals.currentUser = req.user; //This allows me to make things show or not show, depending on the user signed in
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// Route Handlers
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)




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