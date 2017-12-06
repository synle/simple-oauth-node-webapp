const resourceUtil = require('../libs/resourceUtil');
const util = require('../libs/util');
const o365AuthUtil = require('../libs/o365AuthUtil');
const googleAuthUtil = require('../libs/googleAuthUtil');


// route definitions...
module.exports = function(app, passport){
    // auth
    app.get('/', async function(req, res, next) {
        if(req.session.email){
            return res.redirect('/main');
        }

        res.render(
            'index',
            {
                o365LoginUrl: o365AuthUtil.getOAuthLoginUrl(),
                googleLoginUrl: googleAuthUtil.getOAuthLoginUrl(),
            }
        );
    });



    // post - process login ajax
    app.get('/login/o365', async function(req, res) {
        try{
            const {code, state} = req.query;
            const access_token_response = await o365AuthUtil.getAccessToken('authorization_code', code);

            // persist the token
            const userObject = await resourceUtil.upsertO365AccessToken(
                'refresh_token',
                access_token_response.refresh_token
            );

            // persist sessions...
            req.session.email = userObject.email
            req.session.displayName = userObject.display_name

            // ready to go...
            res.redirect('/main')
        } catch(e){
            console.error('Server Error', e);
            res.status(500)
                .send('Invalid Code... Please try again...' + e)
        }
    });


    app.get('/login/google', async function(req, res) {
        try{
            const {code, state} = req.query;
            const userObject = await resourceUtil.upsertGoogleAccessToken(code);


            // persist sessions...
            req.session.email = userObject.email
            req.session.displayName = userObject.display_name

            // ready to go...
            res.redirect('/main')
        } catch(e){
            console.error('Server Error', e);
            res.status(500)
                .send('Invalid Code... Please try again...' + e)
        }
    });


    app.get('/main', isLoggedIn, async function(req, res){
        // ready to go...
        res.render(
            'main',
            {
                o365_client_id: o365AuthUtil.getAppId(),
                google_client_id: googleAuthUtil.getAppId(),
                email: req.session.email,
                displayName: req.session.displayName,
            }
        );
    })


    app.get('/logout', async function(req, res) {
        // clear their tokens and log them out...
        Object.keys(req.session)
            .forEach((key) => {
                delete req.session[key]
            })

        // ready to go...
        res.redirect('/')
    });
}


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    const {email, displayName} = req.session;

    if(email&& displayName){
        return next();
    }

    const method = (req.method || '').toUpperCase();

    if(method === 'GET'){
        // if they aren't redirect them to the home page
        return res.redirect('/');
    } else {
        res.json({
                success: false,
                error: 'Unauthorized',
            })
            .status(403)
    }
}
