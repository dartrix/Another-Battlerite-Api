'use strict';

module.exports = function(app, config) {

    var helpers = {
        account: require('./helpers/accountHelper.js')()
    };

    var services = {
        battlerite: require('./services/battleriteService')(config, helpers.account)
    };

    var controllers = {
        admin: require('./controllers/adminController')(),
        teams: require('./controllers/teamController')(config, services.battlerite),
        accounts: require('./controllers/accountController')(config, services.battlerite, helpers.account)
    };

    // Admin routes
    app.get('/admin/ping', controllers.admin.ping);

    // Account routes
    app.get('/api/v1/id/:account_name', controllers.accounts.getAccountIdByName);

    app.get('/api/v1/account/details/:account_id', controllers.accounts.getOrCreate);

    app.get('/api/v1/account/:account_id', controllers.accounts.getPublicAccount);

    //Team routes
    app.get('/api/v1/teams/:account_id/season/:season', controllers.teams.getOrCreate)


};
