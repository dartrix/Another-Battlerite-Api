'use strict';

var SteamUser = require('steam-user');
var request = require('request');
var _ = require('lodash');
var async = require('async');
var snakeCaseHelper = require('../helpers/snakeCaseHelper.js')();
var JSONbig = require('json-bigint')

module.exports = function (config, accountHelper) {
    var service = {};

    var client = new SteamUser();
    var sessionId = null;

    if (!sessionId) {
        console.log('no session id');
        client.logOn(
            config.steam
        );

        client.on('error', function (error) {
            console.log('error');
            console.error(error);
        });

        client.on('disconnected', function (error) {
            console.log('disconnected');
        });

        client.on('LogonSessionReplaced', function(){console.log('here')});

        client.on('loggedOn', function() {
            console.log('Logging on to steam as user: ' + config.steam.accountName)
            client.getEncryptedAppTicket(504370, new Buffer(0), function (error, steamKey) {
                if (error) {
                    console.error(error)
                } else {
                    console.log('Got Steam Encrypyted App Ticket: ' + steamKey.toString('base64'));
                    var options = {
                        url: config.battlerite.protocol + config.battlerite.host + '/auth/steam-async/v1',
                        json: {
                            key: steamKey.toString('base64') // convert the response to base64
                        }
                    };

                    request.post(options, function (error, response, body) {
                        if (error) {
                            console.error(error)
                        } else {
                            // Need to do this regex parse because... for some reason they return malformed JSON
                            var regex = /{"sessionID":"(\w*)","refreshToken":"(\w*)","timeUntilExpire":(\w*),"userId":(\w*)}/;
                            var matches = regex.exec(body);
                            var jsonBody = JSON.parse(matches[0]);
                            sessionId = jsonBody.sessionID;
                            console.log('Successfully logged into Battlerite with sessionId: ' + sessionId);
                        }
                    })
                }
            })
        });
    }
    // ---------------------------------Battlerire Services---------------------------------------


    //-----------------------------------------Post------------------------------------------------

    //Get Data (2v2 2v2team 3v3 3v3team) from account Id
    service.getTeamsByAccountId = function (accountIds, season, cb) {
        if (sessionId) {
            if (typeof accountIds === 'string') {
                var options = {
                    url: config.battlerite.protocol + config.battlerite.host + '/ranking/teams',
                    authorization: 'Bearer ' + sessionId,
                    json: {
                      users: [accountIds],
                      season: season,
                    },
                    jsonReviver: (key, value)=>{
                      value = JSONbig.parse(value)
                      console.log(value)
                      return value
                    }

                };
                if (season > 0 && season <= config.battlerite.currentSeason) {
                  request.post(options, function (error, response, body) {
                    var bdy = JSONbig.parse(body)
                      if (error) {
                          cb({code: 500, message: 'Internal server error'});
                      } else {
                        if (bdy.teams[0] != null && bdy.teams[0] != undefined){
                            cb(null, JSONbig.parse(body));
                        } else{
                          cb({code: 404, message: 'Team not found.'});
                        }

                      }
                  });
                } else {
                  cb({code: 404, message: 'Season not found.'});
                }

            } else {
                cb({code: 400, message: "Bad request. 'account_ids' must be an array of strings"});
            }
        } else {
            cb({code: 401, message: 'Unauthorized'});
        }
    };

    //get public account info from account id
    service.getAccountsByAccountId = function (accountIds, cb) {
        if (sessionId) {
            if (accountIds.length) {
                var options = {
                    url: config.battlerite.protocol + config.battlerite.host + '/account/public/v1',
                    headers: {
                        authorization: 'Bearer ' + sessionId
                    },
                    json: {
                        users: [accountIds]
                    }
                };
                request.post(options, function (error, response, body) {
                    if (error) {
                        cb({code: 500, message: 'Internal server error'});
                    } else {

                        var inventories = _.map(body.inventories, function (inventory) {
                            var stackables = accountHelper.transformIdsToNames(inventory.stackables);
                            stackables.account_id = inventory.userId;

                            return stackables;
                        });
                        cb(null, inventories);
                    }
                });
            } else {
                cb({code: 400, message: "Bad request. 'account_ids' must be an array of strings"});
            }
        } else {
            cb({code: 401, message: 'Unauthorized'});
        }
    };

    service.getPublicAccount = function (accountIds, cb) {
        if (sessionId) {
            if (typeof accountIds === 'string') {
                var options = {
                    url: config.battlerite.protocol + config.battlerite.host + '/account/profile/public/v1',
                    authorization: 'Bearer ' + sessionId,
                    json: {
                      users: [accountIds]
                    },
                    jsonReviver: (key, value)=>{
                      value = JSONbig.parse(value)
                      return value
                    }

                };
                request.post(options, function (error, response, body) {

                    if (error) {
                        cb({code: 500, message: 'Internal server error'});
                    } else {
                        var bdy = JSONbig.parse(body);
                        if(bdy.profiles != null && bdy.profiles != undefined ){
                          if (bdy.profiles[0] != null && bdy.profiles[0] != undefined ) {
                            cb(null, bdy);
                          }else{
                            cb({code: 404, message: 'User not found.'});
                          }

                        }
                        else{
                          cb({code: 404, message: 'User not found.'});
                        }

                    }
                });
            } else {
                cb({code: 400, message: "Bad request. 'account_ids' must be an array of strings"});
            }
        } else {
            cb({code: 401, message: 'Unauthorized'});
        }
    };

    //-----------------------------------------Get-------------------------------------------------

    //Get account id from user name
    service.getAccountId = function (accountName, cb) {
        if (sessionId) {
            if (typeof accountName === 'string') {
                var options = {
                    url: config.battlerite.protocol + config.battlerite.host + '/account/profile/id/v1',
                    headers: {
                        authorization: 'Bearer ' + sessionId
                    },
                    qs: {
                        name: accountName
                    }
                };
                request.get(options, function (error, response, body) {
                    if (error) {
                        cb({code: 500, message: 'Internal server error'});
                    }
                    cb(null, {code: 200, message: 'Ok', data: JSONbig.parse(body) });
                });
            } else {
                cb({code: 400, message: "Bad request. 'name' must be of type 'string', was of type '" + typeof accountName + "'"});
            }
        } else {
            cb({code: 401, message: 'Unauthorized'});
        }
    };


return service;
};
