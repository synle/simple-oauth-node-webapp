const unirest = require('unirest');
const _ = require('lodash');
const moment = require('moment');
const azure = require('azure-storage');

// other util
const commonUtil = {
    makeO365Call: async (method, url, o365AuthToken, data, headers) => {
        return new Promise((resolve, reject) => {
            const requestObject = unirest[method](url)
                .headers(
                    Object.assign(
                        {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${o365AuthToken}`
                        },
                        headers || {}
                    )
                );

            // pass in data if  needed
            if(data){
                requestObject.send(data);
            }

            requestObject.end(function (response) {
                const error = _.get(response, 'body.error') || null;

                if(error){
                    reject(error)
                } else{
                    // console.log('====')
                    // console.log(JSON.stringify(response.body, null, 4))
                    resolve(response.body);
                }
            });
        });
    },
    wait: (ms) => {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    },
    encrypt: (plainText) =>{
        return plainText;
        // return process.env.SESSION_PASS_KEY + plainText
    },
    decrypt: (cypherText) => {
        return cypherText;
        // return cypherText.replace(process.env.SESSION_PASS_KEY, '');
    },
}


// o365 api utils
const o365 = {
    getUsersInformation: async (o365AuthToken) => {
        // https://graph.microsoft.com/v1.0/me
        return commonUtil.makeO365Call(
             'get',
             'https://graph.microsoft.com/v1.0/me',
             o365AuthToken
        );

    },
}


// export
module.exports = {
    o365,
    commonUtil,
}
