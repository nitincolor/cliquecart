# Installing and Deploying CozyCommerce

## Install and Deploy CozyCommerce

In this part of the documentation we will show you how to install CozyCommerce.

<Callout type="info">
  Before moving forward, make sure you have Node.js installed on your machine.
  Otherwise the installation commands will not work.
</Callout>

**1.** Download template and extract it. Then CD into that directory and run this command to install the dependencies:

```bash
npm install
# or
yarn install
```

<!-- > Some included packages causes peer-deps issue with React 19 while installing.
> With npm the `--legacy-peer-deps` flag is a workaround for that at the moment. -->

**2.** After completing the installation run this command to start the developement server:

```bash copy
npm run dev
```

or

```bash copy
yarn dev
```


### Next Steps

Once the installation is done,  
Follow these steps to complete the installation.

1. [Database Integration - PostgreSQL on Vercel ](https://CozyCommerce.com//docs/database/postgresql)

<Callout type="info">
  **Note:** you can use any PostgreSQL you want. Just save the database url in
  the env using this name:
</Callout>

```
DATABASE_URL=YOUR_DB_CONNECT_URL
```

2. [Authentication](https://CozyCommerce.com/docs/authentication)

3.[Stripe Integration](https://CozyCommerce.com/docs/stripe)

4.[Algolia Integration](https://CozyCommerce.com/docs/algolia)

---

## Deploying to server

After the installation and customization are done you have to deploy the template.
Here are the steps you need to follow to deploy the template:

Build the template locally and then deploy it to the server.
Build the template using the following command, When you run this command you’ll get a build folder. Now you can upload this folder to your server and your site will be live.

```bash copy
npm run build
```

or

```bash copy
yarn build
```

## Update Logs

Version 1.2.2 - Improvements - [July, 2025]

- Fixed linking issues throughout the site
- Updated Add to Cart functionality to open the cart sidebar

Version 1.2.1 - Features - [Feb 13, 2025]

- Upgraded to Next15
- Upgraded to Tailwind v4
- Form validation using React Hook Form
- Fully functional checkout page(with input validation and state changes)
- Refactored products filtering; querying from Sanity.
- Managing user addresses(Shipping and Billing) on database.
- Improve re-usability, code refactoring etc.

Version 1.0.1 - Patches - [Feb 02, 2025]

- Fix countdown timer
- Showing indicator if product has been added to wishlist
- Redesign _Empty Cart_ page
