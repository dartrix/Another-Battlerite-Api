'use strict';

var _ = require('lodash');

module.exports = function (config, battleriteService, redisHelper) {
    var controller = {};

    controller.getOrCreate = function (req, res) {
        // TODO may need to parse account_ids for validity
        battleriteService.getTeamsByAccountId(req.params.account_id, req.params.season, function (error, teams) {
            if (error) {
                res.status(error.code).json(error);
            } else {
                res.status(201).send({code: 201, message: 'Created', data: teams});
            }
        });
    };

    return controller;
};
