const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieSession = require('cookie-session')

const app = express();

app.set('trust proxy', 1) // trust first proxy


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



// node sass
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));


app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_PASS_KEY || 'some_random_key'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


app.use(function (req, res, next) {
    if (!req.session.isLoggedIn) {
        req.session.isLoggedIn = false;
    }

    next()
})



app.use(express.static(path.join(__dirname, 'public')));


//router
require('./routes/index')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});




module.exports = app;
