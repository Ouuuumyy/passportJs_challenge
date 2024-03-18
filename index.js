const passport = require('passport');
const FacebookStrategy =require('passport-facebook').Strategy;
const session = require('express-session');
const express = require('express');
const app = express();
require('dotenv').config();
app.set('view-engine', 'ejs');

app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
    clientID : process.env.FACEBOOK_APP_ID,
    clientSecret : process.env.FACEBOOK_SECRET_KEY,
    callbackURL : '/facebook',
    profileFields : ['emails','displayName', 'name', 'picture']
},

(accessToken, refreshToken, profile, done) => {
    done(null,profile);
}
));

passport.serializeUser((user,done)=>{
    done(null,user);
});

passport.deserializeUser((user,done)=>{
    done(null,user);
});

app.get('/login',(req,res)=>{
    res.render('index.ejs');
})

app.get('/login/facebook', passport.authenticate('facebook'))

app.get('/facebook', passport.authenticate('facebook', {failureRedirect : '/'}),
    (req,res)=>{
        req.session.isLoggedIn = true;
        const sessionId = req.sessionID;
        res.cookie('sessionId', sessionId, { httpOnly: true ,maxAge :86000})
        res.redirect('/dashbord');
        console.log('User:', req.user);  // Log the user object
        console.log('Is Authenticated?', req.isAuthenticated());  // Log the authentica

    });

app.get('/dashbord',(req,res)=>{
    //res.send(req.user? req.user['displayName'] : 'invalid account log in with facebook');
    res.render('dashbord.ejs', {username : req.user['displayName']});

})

// app.get('/logout', (req, res) => {
//     if (req.isAuthenticated()) {
//         const facebookLogoutUrl = `https://www.facebook.com/logout.php?next=http://localhost:3000/login/&access_token=`;
//         req.session.destroy((err) => {
//             if (err) {
//                 res.status(500).json({ error: 'internal server prob' });
//             }
//             res.clearCookie('sessionId');
//             res.redirect(facebookLogoutUrl);
//         });
//     } else {
//         res.status(401).json({ error: 'Not authenticated' });
//     }
//     console.log('Is Authenticated?', req.isAuthenticated());  
// });

app.get('/logout', (req, res) => {
    if (req.isAuthenticated()) {
        // req.logout(function(err) {
        //     if (err) { return next(err); }
        //     res.redirect('/login');
        //   });
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ error: 'internal server prob' });
            }
            res.clearCookie('sessionId');
            res.redirect('/login');

        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.listen(process.env.PORT,()=>{
    console.log("server listening on port",process.env.PORT);
})
