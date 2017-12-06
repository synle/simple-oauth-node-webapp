const unirest = require('unirest');
const util = require('./util');

const O365_CLIENT_ID = process.env.O365_CLIENT_ID;
const O365_SCOPE = process.env.O365_SCOPE;
const O365_CLIENT_SECRET = process.env.O365_CLIENT_SECRET;
const O365_TOKEN_REDIRECT_URL = process.env.O365_TOKEN_REDIRECT_URL;
const O365_STATE = 'app_init'; // TODO: this should be a nonce


const getAppId = () => O365_CLIENT_ID;
const getAppSecret = () => O365_CLIENT_SECRET;
const getScope = () => O365_SCOPE;
const getRedirectUrl = () => O365_TOKEN_REDIRECT_URL;

const getOAuthLoginUrl = () => {
    const response_type = 'code';
    const response_mode = 'query';

    const url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
        "response_type=" + encodeURI(response_type) + "&" +
        "client_id=" + encodeURI(O365_CLIENT_ID) + "&" +
        "scope=" + encodeURI(O365_SCOPE) + "&" +
        "redirect_uri=" + encodeURI(O365_TOKEN_REDIRECT_URL) + "&" +
        "response_mode=" + encodeURI(response_mode) + "&" +
        "state=" + encodeURI(O365_STATE);

    return url;
}

const getUserDetails = async (accessToken) => {
    return util.commonUtil.makeO365Call(
         'get',
         'https://graph.microsoft.com/v1.0/me',
         accessToken
    );

}



// make real api calls....
// grant_type = refresh_token, authorization_code
const getAccessToken = async (grant_type, code) => {
    const oauth_body = {
        refresh_token: code,
        code,
        grant_type,
        client_id: getAppId(),
        client_secret: getAppSecret(),
        scope: getScope(),
        redirect_uri: getRedirectUrl(),
    };

    return new Promise((resolve, reject) => {
        unirest.post('https://login.microsoftonline.com/common/oauth2/v2.0/token')
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
}


module.exports = {
    getOAuthLoginUrl,
    getAppId,
    getAppSecret,
    getScope,
    getRedirectUrl,
    getUserDetails,
    getAccessToken,
}
