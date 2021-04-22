const express        = require('express');
const morgan         = require('morgan');
const bodyParser     = require('body-parser');
const ejsMate        = require('ejs-mate');
const methodOverride = require('method-override');
const session        = require('express-session');
const passport       = require('passport');
const localStrategy  = require('passport-local');
const path           = require('path');
const mongoose       = require('mongoose');
const config         = require('./config');
const User           = require('./models/userSchema');
const app            = express();

mongoose.connect('mongodb+srv://simplyForum:simplyForum1234@cluster0.jt7qc.mongodb.net/database?retryWrites=true&w=majority', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: true
});

//MORGAN
app.use(morgan('dev'));

//VIEWS
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//BODY PARSER
app.use(bodyParser.urlencoded({extended: true}));

//REST
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//SESSION
const sessionConfig = {
    secret: 'SECRET_KEY',
    resave: false,
    saveUninitialized: true
}
app.use(session(sessionConfig));

//PASSPORT 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//MAIN ROUTES
const mainRoute = require('./routes/main');
app.use(mainRoute);

//ALL AUTH ROUTES
const authRoute = require('./routes/auth/auth');
const confirmationRoute = require('./routes/auth/confirmEmail');
app.use(authRoute);
app.use(confirmationRoute);

//ALL THREADS
const parentNode = require('./routes/threads/parentNode');
const subNode = require('./routes/threads/subNode');
const thread = require('./routes/threads/thread');
const threadComment = require('./routes/threads/threadComment');

app.use(parentNode);
app.use(subNode);
app.use(thread);
app.use(threadComment);

//PRIVATE MESSAGES
const allMessages = require('./routes/privateMessage/allMessages');
const messageCreation = require('./routes/privateMessage/messageCreation');
const viewMessage = require('./routes/privateMessage/viewMessage');

app.use(allMessages);
app.use(messageCreation);
app.use(viewMessage);

//USERS
const userNotifications = require('./routes/user/notifications');

app.use(userNotifications);

app.listen(8000);

