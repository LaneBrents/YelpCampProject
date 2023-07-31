const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');



// Client-side validation
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//This renders the 'all campgrounds' page
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('Campgrounds/index', {campgrounds})
}));

// This renders the new campground form page
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

// This sends a POST request from the new campground form page
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully Made A New Campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

// This renders the campground info page
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Cannot Find That Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// This renders the edit page for a campground
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', 'Cannot Find That Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// This allows a user to update a campground
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully Updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

// This deletes a campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted Campground');
    res.redirect('/campgrounds');
}));

module.exports = router;
