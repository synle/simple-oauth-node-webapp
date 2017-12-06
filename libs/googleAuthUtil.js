const unirest = require('unirest');
const util = require('./util');

const GOOGLE_TOKEN_REDIRECT_URL=process.env.GOOGLE_TOKEN_REDIRECT_URL;
const GOOGLE_SCOPE=process.env.GOOGLE_SCOPE;
const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TYPE=process.env.GOOGLE_ACCESS_TYPE;
const GOOGLE_STATE = 'app_init'; // TODO: this should be a nonce


const getAppId = () => GOOGLE_CLIENT_ID;
const getAppSecret = () => GOOGLE_CLIENT_SECRET;
const getScope = () => GOOGLE_SCOPE;
const getRedirectUrl = () => GOOGLE_TOKEN_REDIRECT_URL;

const getOAuthLoginUrl = () => {
    // https://developers.google.com/identity/protocols/OAuth2WebServer
    const response_type = 'code';
    const include_granted_scopes = 'true';

    const url = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        'scope=' + encodeURI(GOOGLE_SCOPE) + "&" +
        'response_type=' + encodeURI(response_type) + "&" +
        'access_type=offline&'+
        'state=' + encodeURI(GOOGLE_STATE) + "&" +
        'redirect_uri=' + encodeURI(GOOGLE_TOKEN_REDIRECT_URL) + "&" +
        'client_id=' + encodeURI(GOOGLE_CLIENT_ID) + "&" +
        // 'include_granted_scopes=' + encodeURI(response_type) + "&" +
        '';


    return url;
}


const getUserDetails = async (accessToken) => {
    // id
    // name
    // email
    // given_name
    // family_name
    // link
    // picture
    // gender: 'male'
    // locale: 'en'

    return new Promise((resolve, reject) => {
        unirest.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json')
            .headers({
                'Authorization': `Bearer ${accessToken}`
            })
            .end((response) => {
                if(response.error){
                    reject(response.body);
                } else{
                    // decrypt it...
                    resolve(response.body);
                }
            });
    });
}


const getAccessToken = async (code) => {
    const oauth_body = {
        code,
        grant_type: 'authorization_code',
        client_id: getAppId(),
        client_secret: getAppSecret(),
        scope: getScope(),
        redirect_uri: getRedirectUrl(),
    };

    return new Promise((resolve, reject) => {
        unirest.post('https://www.googleapis.com/oauth2/v4/token')
            .headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            .send(oauth_body)
            .end((response) => {
                if(response.error){
                    reject(response.body);
                } else{
                    // decrypt it...
                    resolve(response.body);
                }
            });
    });
};



module.exports = {
    getOAuthLoginUrl,
    getAppId,
    getAppSecret,
    getScope,
    getRedirectUrl,
    getUserDetails,
    getAccessToken,
}
