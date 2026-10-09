# LUMINA — Full-Stack Skincare E-Commerce Platform

LUMINA is a luxury skincare store with a real backend: a product catalog served from MongoDB, user accounts with JWT authentication, a rule-based **Routine Finder**, a cart and checkout flow with **Stripe (test mode)** payments, and customer reviews.

> Frontend UI design based on the original LUMINA design . Backend, API integration, authentication, checkout, and payments


---

## Features

- **Dynamic product catalog** — products are fetched from MongoDB and rendered on the page, not hardcoded
- **Routine Finder** — pick a skin type and concerns, and get a step-by-step routine (Cleanser → Toner → Serum → Moisturizer) using rule-based matching on product tags
- **Authentication** — register and sign in with bcrypt-hashed passwords and JWT sessions, with clear validation messages and sign out
- **Cart** — add, remove, and change quantities; the cart persists in the browser
- **Checkout and payments** — shipping details, order creation, and card payment through Stripe Payment Intents (test mode)
- **Order security** — order totals are calculated on the server from database prices, never trusted from the browser
- **Reviews** — signed-in users can rate (1–5 stars) and comment on products; reviews are loaded live from the database


<p>
  <img src="screenshots/Screenshot 2026-10-10 003449.png" width="48%">
  <img src="screenshots/Screenshot 2026-10-10 010329.png" width="48%">
  <img src="screenshots/Screenshot 2026-10-10 010748.png" width="48%">
  <img src="screenshots/Screenshot 2026-10-10 010942.png" width="48%">

</p>


## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript, Stripe.js |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Payments | Stripe API (test mode) |

## Project Structure

```
LUMINA/
├── index.html
├── style.css
├── script.js
├── *.png                      # images
└── lumina-backend/
    ├── server.js              # app entry point
    ├── seed.js                # sample product data
    ├── models/                # Product, User, Order, Review
    ├── controllers/           # business logic
    ├── routes/                # API route definitions
    └── middleware/
        └── authMiddleware.js  # JWT verification
```

## API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/products` | No | List all products |
| GET | `/products/:id` | No | Get one product |
| POST | `/products` | No* | Create a product |
| PUT | `/products/:id` | No* | Update a product |
| DELETE | `/products/:id` | No* | Delete a product |
| POST | `/routine-finder` | No | Get a routine for `skinType` and `concerns` |
| POST | `/auth/register` | No | Create an account |
| POST | `/auth/login` | No | Sign in and receive a JWT |
| POST | `/orders` | Yes | Create an order |
| GET | `/orders/my-orders` | Yes | List the current user's orders |
| GET | `/orders/:id` | Yes | Get one of the user's orders |
| POST | `/payments/create-payment-intent` | Yes | Create a Stripe Payment Intent for an order |
| GET | `/reviews` | No | List all reviews |
| GET | `/reviews/product/:productId` | No | List reviews for a product |
| POST | `/reviews` | Yes | Submit a review |

Protected routes expect the header `Authorization: Bearer <token>`.

\* Product create/update/delete are currently open; see the roadmap below.

## Getting Started

### Prerequisites

- Node.js 18 or later
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A free [Stripe](https://stripe.com) account (sandbox / test mode)

### 1. Clone the repository

```bash
git clone https://github.com/Maram-nabil/Lumina.git
cd Lumina/lumina-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `lumina-backend/`:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=a_long_random_secret
STRIPE_SECRET_KEY=sk_test_...
```

Then put your Stripe **publishable** key (`pk_test_...`) in `STRIPE_PUBLISHABLE_KEY` at the top of `script.js`. Never commit the secret key or the `.env` file.

### 4. Seed the database (optional)

```bash
node seed.js
```

### 5. Run the backend

```bash
npm run dev
```

### 6. Run the frontend

Open `index.html` with the VS Code **Live Server** extension (or any static server) while the backend is running.

## Testing Payments

Use Stripe's test card at checkout:

- Card number: `4242 4242 4242 4242`
- Expiry: any future date (for example `12/30`)
- CVC: any 3 digits
- ZIP: any value

No real money is charged.

## Roadmap

- [ ] My Orders page in the frontend (the API endpoint already exists)
- [ ] Product details page with per-product reviews
- [ ] Admin panel and admin-only access for product create/update/delete
- [ ] Real product images
- [ ] Deployment (backend and frontend)

## Author

**Maram Nabil** — Backend Developer
GitHub: [@Maram-nabil](https://github.com/Maram-nabil)