'use strict';

var _ = require('lodash');

module.exports = function (config, battleriteService) {
    var controller = {};

    controller.getAccountIdByName = function(req, res) {
        battleriteService.getAccountId(req.params.account_name, function (error, account) {
            if (error) {
                res.status(error.code).json(error);
            } else {
                res.status(account.code).json(account);
            }
        });
    };

    controller.getOrCreate = function (req, res) {
        battleriteService.getAccountsByAccountId(req.params.account_id,  function (error, accounts) {
            if (error) {
                res.status(error.code).json(error);
            } else {
              console.log(accounts)
                res.status(201).json({code: 201, message: 'Created', data: accounts});
            }
        });
    };

    controller.getPublicAccount = function (req, res) {
        battleriteService.getPublicAccount(req.params.account_id,  function (error, accounts) {
            if (error) {
                res.status(error.code).json(error);
            } else {
              console.log(accounts)
                res.status(201).json({code: 201, message: 'Found', data: accounts});
            }
        });
    };


    return controller;
};
