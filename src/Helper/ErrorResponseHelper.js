/**
 * This file container functions that can be used to send common reponses using expressjs
 */

function resInvalidParams(res, message="") {
    return res.send({
        error: "Invalid params",
        message: message
    });
}

module.exports =  {
    resInvalidParams
};