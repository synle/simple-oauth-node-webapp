(function(){
  window.ajaxUtil = {};
  const ajaxUtil = window.ajaxUtil;

  const _sendRequest = (useJson, method, url, body, inputHeaders, inputFetchOption) => {
    const headers = Object.assign(
      {
        'Accept': useJson === true ? 'application/json' : 'text/plain',
        'Content-Type': 'application/json'
      },
      inputHeaders
    );

    const fetchOptions = Object.assign(
      {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        mode: 'cors',
        credentials: 'include'
      },
      inputFetchOption
    );

    let finalResp;
    return fetch(
      url,
      fetchOptions
    )
      // json the object
      .then((response) => {
        // skeleton for the final resp
        finalResp = {
          ok: response.ok,
          status: response.status
        };

        if (useJson === true) {
          return response.json();
        }

        return response.text();
      })
      .then((responseBody) => {
        // capture the result in body
        finalResp.body = responseBody;

        if (finalResp.ok === true) {
          return finalResp;
        } else {
          throw finalResp;
        }
      });
  };

    // get stuffs as json
    ajaxUtil.getJson = _sendRequest.bind(null, true, 'GET')
    ajaxUtil.postJson = _sendRequest.bind(null, true, 'POST')
    ajaxUtil.putJson = _sendRequest.bind(null, true, 'PUT')
    ajaxUtil.deleteJson = _sendRequest.bind(null, true, 'DELETE')

    // get stuffs as plain text
    ajaxUtil.getText = _sendRequest.bind(null, false, 'GET')
    ajaxUtil.postText = _sendRequest.bind(null, false, 'POST')
    ajaxUtil.putText = _sendRequest.bind(null, false, 'PUT')
    ajaxUtil.deleteText = _sendRequest.bind(null, false, 'DELETE')
})()
