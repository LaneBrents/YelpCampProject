const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

const Campground = require('../models/campground');


//This renders the 'all campgrounds' page
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('Campgrounds/index', { campgrounds })
}));

// This renders the new campground form page
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// This sends a POST request from the new campground form page
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully Made A New Campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

// This renders the campground info page
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot Find That Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// This renders the edit page for a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot Find That Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// This allows a user to update a campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully Updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

// This deletes a campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted Campground');
    res.redirect('/campgrounds');
}));

module.exports = router;
