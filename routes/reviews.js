const express = require('express');
const router = express.Router({ mergeParams: true });

const Campground = require('../models/campground');
const Review = require('../models/review')

const { reviewSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


// Client-side validation
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// This allows us to create a revierw on a campground/:id
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created New Review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// This will allow the specific user to delete their review, not other users
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully Deleted Review');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;