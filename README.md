BATTLERITE API BASED ON [jlajoie battlerite-api](https://github.com/jlajoie/battlerite-api)

# Routes

**/admin/ping**
Returns a 200 Ok status. Used for simple health checks
```
{
  "code": 200,
  "message": "Ok"
}
```
**/api/v1/id/:account_name**
Returns the user_id used for the accounts and teams endpoints.

Using account_name = averse, you'll get the following response.
```
{
  "code": 200,
  "message": "Ok",
  "data": {
    "userId": "776450744541908992"
  }
}
```


**/api/v1/account/details/:account_id**
Returns all yours champions wins/losses/level, your total of wins and losses, rating and top team league/divison/season/division_rating

**/api/v1/account/:account_id**
Returns your profile info

Using accound_id = 776450744541908992 you'll get the following response.

```
{
  "code": 201,
  "message": "Found",
  "data": {
    "profiles": [
    {
      "userId": "776450744541908992",
      "name": "Averse",
      "title": 60015,
      "picture": 39049
    }
    ]
  }
}
```

**/api/v1/teams/:account_id/season/:season**
Returns all your teams in that season.
If you're interested in getting your Solo Queue statistics, the team has only a single person as a member.
