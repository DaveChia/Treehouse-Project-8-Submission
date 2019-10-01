const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/library.db'
});


const express = require('express');
const app = express();
const { Op } = Sequelize;

let allBooksArray = [];
app.set('view engine', 'pug');
app.use('/static', express.static('public'));
app.use(express.static(__dirname + '/public/assets'));
app.use(express.urlencoded());

getAllBooksFromDB();

app.get('/', (request, response) => {

    response.redirect('/page:0');
    response.end();
});


app.get('/page:id', (request, response) => {

    let queryID = (request.param("id"));
    queryID = queryID.replace(":", "");

    let paginationArray = [];
    let filterBooksArray = [];

    for (let i = 0; i < Math.ceil(allBooksArray.length / 10); i++) {

        paginationArray.push(i);

    }

    for (let i = parseInt(queryID) * 10; i < parseInt(queryID) * 10 + 10; i++) {

        if (allBooksArray[i]) {
            filterBooksArray.push(allBooksArray[i]);

        }

    }

    response.render('./index', { data: filterBooksArray, data2: paginationArray });
});




app.get('/books', (request, response) => {

    response.redirect('/');
    response.end();
});

app.get('/books/new', (request, response) => {

    response.render('./new-book', { loadError: false });
});

app.get('/books/error:id', (request, response) => {

    response.render('./new-book', { loadError: true });
});

app.get('/error', (request, response) => {

    response.render('./error');
});

app.post('/books/new', (req, res) => {

    (async () => {
        // await sequelize.sync({ force: true });

        const bookTitle = req.body.title
        const bookAuthor = req.body.author
        const bookGenre = req.body.genre
        const bookYear = req.body.year

        try {
            await sequelize.authenticate();
            const book = await Book.create({

                title: bookTitle,
                author: bookAuthor,
                genre: bookGenre,
                year: bookYear

            });
            getAllBooksFromDB();
            res.redirect('/');
            res.end();
        } catch (error) {

            if (error.name === 'SequelizeValidationError') {
                const errors = error.errors.map(err => err.message);
                console.error('Validation errors: ', errors);

                // if (req.body.title == "" && req.body.bookAuthor == "") {
                //     res.render('./new-book', { loadError: false, loadError: true, emptyTitle: true, emptyAuthor: true });

                // }

                if (req.body.title == "") {

                    if (req.body.author == "") {

                        res.render('./new-book', { loadError: true, emptyTitle: true, emptyAuthor: true });

                    } else {

                        res.render('./new-book', { loadError: true, emptyTitle: true });

                    }

                }

                if (req.body.author == "") {

                    res.render('./new-book', { loadError: true, emptyTitle: true, emptyAuthor: true });

                }

                res.end();

            } else {
                console.error('Error connecting to the database: ', error);

            }

        }

    })();

})

app.get('/books:id', (req, response) => {

    let queryID = (req.param("id"));
    queryID = queryID.replace(":", "");

    (async () => {

        try {
            await sequelize.authenticate();
            const bookByID = await Book.findByPk(queryID);
            response.render('./update-book', { data: bookByID.toJSON() });

        } catch (error) {
            response.redirect('/error');
            response.end();
        }
    })();

});

app.post('/books/:id', (req, res) => {

    (async () => {
        // await sequelize.sync({ force: true });

        const bookTitle = req.body.title
        const bookAuthor = req.body.author
        const bookGenre = req.body.genre
        const bookYear = req.body.year
        const bookID = req.body.bookID

        try {

            await sequelize.authenticate();
            const bookToUpdate = await Book.findByPk(bookID);
            bookToUpdate.title = bookTitle;
            bookToUpdate.author = bookAuthor;
            bookToUpdate.genre = bookGenre;
            bookToUpdate.year = bookYear;
            await bookToUpdate.save();

            getAllBooksFromDB();
            res.redirect('/');
            res.end();

        }

        catch (error) {

            if (error.name === 'SequelizeValidationError') {
                const errors = error.errors.map(err => err.message);
                console.error('Validation errors: ', errors);

                const bookByID = await Book.findByPk(req.body.bookID);


                if (req.body.title == "") {

                    if (req.body.author == "") {

                        res.render('./update-book', { data: bookByID, loadError: true, emptyTitle: true, emptyAuthor: true });

                    } else {

                        res.render('./update-book', { data: bookByID, loadError: true, emptyTitle: true });

                    }

                }

                if (req.body.author == "") {

                    res.render('./update-book', { data: bookByID, loadError: true, emptyAuthor: true });
                }

                res.end();
            } else {
                console.error('Error connecting to the database: ', error);

            }
        }

    })();

})


app.post('/search-book', (req, res) => {

    (async () => {
        // await sequelize.sync({ force: true });

        try {
            (async () => {
                const searchValue = req.body.search;

                // await sequelize.sync({ force: true });
                try {

                    await sequelize.authenticate();
                    console.log(searchValue);
                    const books = await Book.findAll({
                        where: {
                            [Op.or]: [
                                {
                                    title: {
                                        [Op.like]: '%' + searchValue + '%'
                                    }

                                },
                                {
                                    author: {
                                        [Op.like]: '%' + searchValue + '%'
                                    }

                                },
                                {
                                    genre: {
                                        [Op.like]: '%' + searchValue + '%'
                                    }

                                },
                                {
                                    year: {
                                        [Op.like]: '%' + searchValue + '%'
                                    }

                                }

                            ]

                        }
                    });
                    allBooksArray = books.map(book => book.toJSON());

                    res.redirect('/');
                    res.end();
                } catch (error) {
                    console.error('Error connecting to the database: ', error);

                }


            })();
        } catch (error) {

            res.redirect('/error');
            res.end();
        }

    })();

})
app.post('/books/:id/delete', (req, res) => {

    (async () => {
        // await sequelize.sync({ force: true });
        const bookID = req.body.bookID

        try {
            const bookToDelete = await Book.findByPk(bookID);
            await sequelize.authenticate();
            await bookToDelete.destroy();
            getAllBooksFromDB();
            res.redirect('/');
            res.end();
        } catch (error) {

            res.redirect('/error');
            res.end();
        }

    })();

})



//Error handler if the user entered an invalid url
app.use((req, res, next) => {
    const err = new Error('Hi we could not find your page, have you entered a wrong address?');
    err.status = 404;
    console.log("Error is " + err + " .The error status is " + err.status);
    next(err);
});

//Displays the error 
app.use((err, req, res, next) => {
    res.locals.error = err;
    res.status(err.status);
    res.render('./page-not-found');
});


app.listen(3000, () => {

    console.log("App is listening to port 3000");

});

// Movie model
class Book extends Sequelize.Model { }
Book.init({

    title: {

        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }

    },
    author: {

        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }

    },
    genre: Sequelize.STRING,
    year: Sequelize.INTEGER

}, { sequelize });

function getAllBooksFromDB() {

    (async () => {

        // await sequelize.sync({ force: true });
        try {

            await sequelize.authenticate();
            console.log('Connection to the database successful!');
            const books = await Book.findAll();
            allBooksArray = books.map(book => book.toJSON());

        } catch (error) {
            console.error('Error connecting to the database: ', error);

        }


    })();


}