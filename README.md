<h1 align="center">Reward Service (Backend Implementation)</h1>


## 🌟 Features

- Player can redeem coupons

## 📖 API Documentation

> http://localhost:3000/docs

```
POST http://localhost:3000/api/v1/coupon/coupon-redeem
Request Body:
{
    "playerId": 1,
    "rewardId": 1
}

Response Body: (200 Status Code)
{
  "status_code": 200,
  "message": "Coupon redeemed successfully",
  "errors": [],
  "data": {
    "id": 1,
    "value": "CPN-Airline ticket-1"
  }
}
```


## 🛠️ Installation

1. Clone the repository:

    ```bash
    $ git clone https://github.com/mirarifhasan/reward-service.git
    ```

2. Install the required packages:

    ```bash
    $ npm install
    ```

3. Run database migration and Populate with initial dummy data
    
    > Update your `.env` file

    ```bash
    $ npm run migration:run
    $ npm run cli:dev
    ```

4. Running the app

    ```bash
    # development mode
    $ npm run start

    # watch mode
    $ npm run start:dev

    # production mode
    $ npm run start:prod
    ```


## ⚔️ Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
