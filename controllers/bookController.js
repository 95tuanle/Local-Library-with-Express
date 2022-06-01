var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

exports.index = function (req, res) {
    async.parallel({
        book_count: function (callback) {
            Book.countDocuments({}, callback);
        },
        book_instance_count: function (callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function (callback) {
            BookInstance.countDocuments({status: 'Available'}, callback);
        },
        author_count: function (callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function (callback) {
            Genre.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', {title: 'Local Library Home', error: err, data: results});
    });
};

exports.book_list = function (req, res) {
    Book.find({}, 'title author').sort({title: 1}).populate('author').exec(function (err, list_books) {
        if (err) {return next(err);}
        res.render('book_list', {title: 'Book List', book_list: list_books});
    });
};

exports.book_detail = function (req, res) {
    async.parallel({
        book: function (callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        book_instance: function (callback) {
            BookInstance.find({'book': req.params.id}).exec(callback);
        }
    }, function (err, results) {
        if (err) {return next(err);}
        if (results.book==null) {
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('book_detail', {title: results.book.title, book: results.book, book_instances: results.book_instance});
    });
};

exports.book_create_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Book create GET');
};

exports.book_create_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Book create POST');
};

exports.book_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

exports.book_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

exports.book_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

exports.book_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};