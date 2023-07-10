const Genre = require("../models/genre");
const Book = require("../models/book");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.genre_list = asyncHandler(async (req, res) => {
    const allGenres = await Genre.find().sort({ name: 1 }).exec();
    res.render("genre_list", {
        title: "Genre List",
        list_genres: allGenres,
    });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (genre === null) {
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
    }
    res.render("genre_detail", {
        title: "Genre Detail",
        genre: genre,
        genre_books: booksInGenre,
    });
});

exports.genre_create_get = (req, res) => {
    res.render("genre_form", { title: "Create Genre" });
};

exports.genre_create_post = [
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        const genre = new Genre({ name: req.body.name });
        if (!errors.isEmpty()) {
            res.render("genre_form", {
                title: "Create Genre",
                genre: genre,
                errors: errors.array(),
            });
        } else {
            const genreExists = await Genre.findOne({ name: req.body.name }).exec();
            if (genreExists) {
                res.redirect(genreExists.url);
            } else {
                await genre.save();
                res.redirect(genre.url);
            }
        }
    }),
];

exports.genre_delete_get = asyncHandler(async (req, res) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (genre === null) {
        res.redirect("/catalog/genres");
    }
    res.render("genre_delete", {
        title: "Delete Genre",
        genre: genre,
        genre_books: booksInGenre,
    });
});

exports.genre_delete_post = asyncHandler(async (req, res) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (booksInGenre.length > 0) {
        res.render("genre_delete", {
            title: "Delete Genre",
            genre: genre,
            genre_books: booksInGenre,
        });
    } else {
        await Genre.findByIdAndRemove(req.body.id);
        res.redirect("/catalog/genres");
    }
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id).exec();
    if (genre === null) {
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
    }
    res.render("genre_form", { title: "Update Genre", genre: genre });
});

exports.genre_update_post = [
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        const genre = new Genre({
            name: req.body.name,
            _id: req.params.id,
        });
        if (!errors.isEmpty()) {
            res.render("genre_form", {
                title: "Update Genre",
                genre: genre,
                errors: errors.array(),
            });
        } else {
            await Genre.findByIdAndUpdate(req.params.id, genre);
            res.redirect(genre.url);
        }
    }),
];