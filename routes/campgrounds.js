const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

//This renders the 'all campgrounds' page
router.get('/', catchAsync(campgrounds.index));

// This renders the new campground form page
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// This sends a POST request from the new campground form page
router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))


// This renders the campground info page
router.get('/:id', catchAsync(campgrounds.showCampground));

// This renders the edit page for a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// This allows a user to update a campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// This deletes a campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
