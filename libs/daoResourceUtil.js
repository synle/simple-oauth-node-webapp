const unirest = require('unirest');
const moment = require('moment');
const _ = require('lodash');
const daoUtil = require('./daoUtil');
const util = require('./util')


const O365_APP_ID = process.env.O365_APP_ID;
const O365_SCOPE_ACCESS = process.env.O365_SCOPE_ACCESS;
const O365_APP_SECRET = process.env.O365_APP_SECRET;
const O365_TOKEN_REDIRECT_URL = process.env.O365_TOKEN_REDIRECT_URL;
const O365_AUTH_SERVER = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
const O365_STATE = 'app_init';

const def = {
    createAccessTokenForOffice365: async (grant_type, token) => {
        // grant_type - init (for first time user), refresh token (subsequent visits)...
        const accessToken = await def.getAccessTokenFromO365ByCode(grant_type, token);
        const userInformation = await util.o365.getUsersInformation(accessToken.access_token);


        // add the new one...
        const new_token_def = {
            display_name: userInformation.displayName,
            job_title: userInformation.jobTitle,
            email: userInformation.mail.toLowerCase(),
            user_principal_name: userInformation.userPrincipalName.toLowerCase(),
            access_token: accessToken.access_token,
            expires_in: Date.now() + accessToken.expires_in, // TODO: fix this up...
            ext_expires_in: accessToken.ext_expires_in,
            id_token: accessToken.id_token,
            refresh_token: accessToken.refresh_token,
            scope: accessToken.scope,
            token_type: accessToken.token_type,
        };


        await def.persistAccessTokenByUserObject(new_token_def, 'office_365');

        return Promise.resolve({
            display_name: new_token_def.display_name,
            email: new_token_def.email,
            access_token: new_token_def.access_token,
            refresh_token: new_token_def.refresh_token,
        })
    },


    persistAccessTokenByUserObject: async (new_token_def, source_type) => {
        // encrypt it when it hits the database...
        new_token_def.access_token = util.commonUtil.encrypt(new_token_def.access_token);
        new_token_def.refresh_token = util.commonUtil.encrypt(new_token_def.refresh_token);
        new_token_def.type = source_type;


        // delete the old one
        await daoUtil.User.destroy({
            where: { email: new_token_def.email }
        });

        // add the new one...
        await daoUtil.User.create(new_token_def);
    },


    getAccessTokenFromDatabase: async (user_email) => {
        const user_object = await daoUtil.User.findOne({
            where: { email: user_email }
        });

        // decrypt it
        user_object.access_token = util.commonUtil.decrypt(user_object.access_token);
        user_object.refresh_token = util.commonUtil.decrypt(user_object.refresh_token);


        // return it
        return Promise.resolve(user_object);
    },


    // make real api calls....
    // grant_type = refresh_token, authorization_code
    getAccessTokenFromO365ByCode: async (grant_type, token) => {
        const oauth_body = {
            grant_type,
            client_secret: O365_APP_SECRET,
            client_id: O365_APP_ID,
            scope: O365_SCOPE_ACCESS,
            redirect_uri: O365_TOKEN_REDIRECT_URL,
            code: token,
            refresh_token: token,
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
    },
}



module.exports = def;
