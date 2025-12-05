# Names
Damon Stevens & Corwyn Giles
# Self Attack
## Damon Stevens


| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 3, 2025                                                               |
| Target         | pizza.cs329blaze.click                                                         |
| Classification | Broken Access Control                                                          |
| Severity       | 2                                                                              |
| Description    | Authentication and user role are not checked for getting a list of franchises  |
| Corrections    | Add auth and role checking to api/franchise/get so only admins can see a list of franchises                              |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 3, 2025                                                               |
| Target         | pizza.cs329blaze.click                                                         |
| Classification | Broken Access Control                                                          |
| Severity       | 2                                                                              |
| Description    | User role is not checked for getting a list of users  |
| Corrections    | Add role checking to api/user/get so only admins can list users                  |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 3, 2025                                                               |
| Target         | pizza.cs329blaze.click                                                         |
| Classification | Broken Access Control                                                          |
| Severity       | 4                                                                              |
| Description    | User role not checked when deleting a franchise, allowing anyone to delete one with the right endpoint                                |
| Corrections    | Add role checking to api/franchise/delete                                      |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 3, 2025                                                               |
| Target         | pizza.cs329blaze.click                                                         |
| Classification | Cryptographic Failures                                                       |
| Severity       | 2                                                                             |
| Description    | User password sent in the response when registering a new user  |
| Corrections    | added method to sanitize user data when sending it                             |


| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 3, 2025                                                               |
| Target         | pizza.cs329blaze.click                                                         |
| Classification | Sql injection                                                    |
| Severity       | 0                                                                            |
| Description    | Attempted to inject sql statements into querying for users and franchises. Did not have any effect.  |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 5, 2025                                                               |
| Target         | pizza.cs329blaze.click                                                         |
| Classification | Sql injection                                                    |
| Severity       | 0                                                                            |
| Description    | Attempted to inject sql statements into the token with multiple requests. No effect  |
| Corrections| |Sanitize inputs|

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 5, 2025                                                               |
| Target         | pizza.cs329blaze.click                                                         |
| Classification | Sql injection                                                    |
| Severity       | 0                                                                            |
| Description    | Attempted to inject sql statements into the username while logging in. Did not have any effect.  |

## Corwyn Giles

# Peer attack

## Damon Stevens' attack on Corwyn Giles

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 3, 2025                                                               |
| Target         | pizza.princecal.click                                                         |
| Classification | Broken Access Control                                                          |
| Severity       | 4                                                                              |
| Description    | User role not checked when deleting a franchise, allowing anyone to delete one with the right endpoint                                |
| Corrections    | Add role checking to api/franchise/delete                                      |
| Image| |

| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 3, 2025                                                               |
| Target         | pizza.princecal.click                                                         |
| Classification | Broken Access Control                                                          |
| Severity       | 4                                                                              |
| Description    | User role not checked when deleting a user, allowing anyone to delete one with the right endpoint                                |
| Corrections    | Add role checking to api/user/delete                                      |


| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | December 5, 2025                                                               |
| Target         | pizza.cs329blaze.click                                                         |
| Classification | Sql injection                                                    |
| Severity       | 0                                                                          |
| Description    | Attempted to inject sql statements into the token with multiple requests. Injection failed  |

## Corwyn Giles' attack on Damon Stevens
