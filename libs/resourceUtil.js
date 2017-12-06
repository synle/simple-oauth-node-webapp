const unirest = require('unirest');
const moment = require('moment');
const _ = require('lodash');

// internal
const daoUtil = require('./daoUtil');
const util = require('./util')
const o365AuthUtil = require('./o365AuthUtil');
const googleAuthUtil = require('./googleAuthUtil');

const def = {
    // common utils...
    createAuthAttempt: async (type) => {
        const model = await daoUtil.AuthAttempt.create({
            type
        })

        return model;
    },
    upsertAccessToken: async (new_token_def) => {
        // encrypt it when it hits the database...
        new_token_def.access_token = util.commonUtil.encrypt(new_token_def.access_token);
        new_token_def.refresh_token = util.commonUtil.encrypt(new_token_def.refresh_token);


        // delete the old one
        await daoUtil.User.destroy({
            where: { email: new_token_def.email, type: new_token_def.type }
        });

        // add the new one...
        await daoUtil.User.create(new_token_def);
    },


    getAccessTokenByEmail: async (user_email) => {
        return daoUtil.User.findAll({
            where: { email: user_email }
        });
    },


    getAccessTokenByVendorType: async (type) => {
        return daoUtil.User.findAll({
            where: { type }
        });
    },


    getAccessTokenByEmailAndVendorType: async (user_email, vendor_type) => {
        return daoUtil.User.findOne({
            where: { email: user_email, type: vendor_type }
        });
    },

    ////////////////////////////////////////////////////////////////////////
    // office 365
    ////////////////////////////////////////////////////////////////////////
    upsertO365AccessToken: async (grant_type, token) => {
        // grant_type - init (for first time user), refresh token (subsequent visits)...
        const accessToken = await o365AuthUtil.getAccessToken(grant_type, token);
        const userDetails = await o365AuthUtil.getUserDetails(accessToken.access_token);


        // add the new one...
        const new_token_def = {
            display_name: userDetails.displayName,
            job_title: userDetails.jobTitle,
            email: userDetails.mail.toLowerCase(),
            user_principal_name: userDetails.userPrincipalName.toLowerCase(),
            access_token: accessToken.access_token,
            expires_in: Date.now() + accessToken.expires_in, // TODO: fix this up...
            refresh_token: accessToken.refresh_token,
            id_token: accessToken.id_token,
            scope: accessToken.scope,
            type: 'office_365',
        };


        await def.upsertAccessToken(new_token_def);

        return {
            display_name: new_token_def.display_name,
            email: new_token_def.email,
            access_token: new_token_def.access_token,
            refresh_token: new_token_def.refresh_token,
        }
    },



    ////////////////////////////////////////////////////////////////////////
    // google
    ////////////////////////////////////////////////////////////////////////
    upsertGoogleAccessToken: async(code) => {
        const accessToken = await googleAuthUtil.getAccessToken(code);
        const userDetails = await googleAuthUtil.getUserDetails(accessToken.access_token);

        // add the new one...
        const new_token_def = {
            display_name: userDetails.name,
            job_title: null,
            email: userDetails.email,
            user_principal_name: null,
            access_token: accessToken.access_token,
            expires_in: Date.now() + accessToken.expires_in, // TODO: fix this up...
            ext_expires_in: null,
            id_token: null,
            refresh_token: accessToken.refresh_token,
            id_token: accessToken.id_token,
            scope: googleAuthUtil.getScope(),
            token_type: null,
            type: 'google',
        };

        await def.upsertAccessToken(new_token_def);

        return {
            display_name: new_token_def.display_name,
            email: new_token_def.email,
            access_token: new_token_def.access_token,
            refresh_token: new_token_def.refresh_token,
        }
    },
}



module.exports = def;
