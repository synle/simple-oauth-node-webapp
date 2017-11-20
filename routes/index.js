const unirest = require('unirest');
const daoResourceUtil = require('../libs/daoResourceUtil');
const util = require('../libs/util');

const O365_APP_ID = process.env.O365_APP_ID;
const O365_SCOPE_ACCESS = process.env.O365_SCOPE_ACCESS;
const O365_APP_SECRET = process.env.O365_APP_SECRET;
const O365_TOKEN_REDIRECT_URL = process.env.O365_TOKEN_REDIRECT_URL;
const O365_AUTH_SERVER = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
const O365_STATE = 'app_init';

function _getOAuthLoginUrl(){
    const response_type = 'code';
    const response_mode = 'query';

    const url = O365_AUTH_SERVER +
        "response_type=" + encodeURI(response_type) + "&" +
        "client_id=" + encodeURI(O365_APP_ID) + "&" +
        "scope=" + encodeURI(O365_SCOPE_ACCESS) + "&" +
        "redirect_uri=" + encodeURI(O365_TOKEN_REDIRECT_URL) + "&" +
        "response_mode=" + encodeURI(response_mode) + "&" +
        "state=" + encodeURI(O365_STATE);

    return url;
}


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
                loginUrl: _getOAuthLoginUrl(),
            }
        );
    });



    // post - process login ajax
    app.get('/login/o365', async function(req, res) {
        try{
            const {code} = req.query;
            const access_token_response = await daoResourceUtil.getAccessTokenFromO365ByCode('authorization_code', code);

            // persist the token
            const userObject = await daoResourceUtil.createAccessTokenForOffice365(
                'refresh_token',
                access_token_response.refresh_token
            );

            // persist sessions...
            req.session.email = userObject.email
            req.session.displayName = userObject.display_name
            req.session.accessToken = userObject.access_token
            req.session.refreshToken = userObject.refresh_token

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
                client_id: O365_APP_ID,
                email: req.session.email,
                displayName: req.session.displayName,
                access_token: req.session.accessToken,
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
    const email = req.session.email || '';
    const displayName = req.session.displayName || '';
    const accessToken = req.session.accessToken || '';
    const refreshToken = req.session.refreshToken || '';

    if(email&& accessToken){
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
