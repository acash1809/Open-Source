# [Ecommerce Store](https://smartshopecomm.herokuapp.com/)

Building a Ecommerce Store where an Admin can Create, Read, Update and Delete a product. A User can view product's details, Add products to cart and order the products in the cart. The project uses MVC architecture and has all the general functionality of a traditional ecommerce website like CRUD on products along with payments, Invoice generation, authentication and validation, etc.

You can check out the website over [here](https://smartshopecomm.herokuapp.com/)

Further iterative enhancements added in [todo.md](https://github.com/harsh-haria/ecom-store/blob/master/todo.md)

---

## Prerequisite

- [NodeJs](https://nodejs.org/en/) (to run the project)
- [MongoDB](https://account.mongodb.com/account/login) Account (for storing everything except the media)
- [Cloduinary](https://cloudinary.com/) Account (for storing the media)
- [SendGrid](https://sendgrid.com/) Account (for sending emails)
- [Stripe](https://stripe.com/en-in) Account (for payments)

---

## Procedure to run the project:

1. Clone this repository using the command below

```
git clone https://github.com/harsh-haria/ecom-store.git
```

2. Open that folder into your favourite text editor and in command line type and run **'npm install'**. This will install all the necessary node modules that are required for this project to run smoothly.<br>

3. Before moving on and starting the server, we need to make sure that we have configured our **'.env'** file which will hold our all secret API keys and passwords. To do this, create a file in the same project folder with name **'.env'** . Make sure you name it exactly as mentioned over here.

4. Now once you have created this file, lets fill in the necessary data with which we will be able to run this project.

```
MONGO_URI = <mongodb_connection_string>
EMAIL_API_KEY = <sendgrid_api_key>
MASTER_EMAIL = <your_master_email_which_you_had_registered_with_sendgrid_goes_here>
STRIPE_SECRET_KEY = <stripes_secret_key>
STRIPE_PUBLIC_KEY = <stripes_public_key>
CLOUD_NAME = <cloudname_entered_in_cloudinary>
CLOUDINARY_API_KEY = <cloudinary_api_key>
CLOUDINARY_API_SECRET = <cloudinary_api_secret>
```

5. Run command 'npm start' to start the server. If you see some message saying **'connected'** in command line, then you have completed all the steps correctly.

6. You can now access the website on **'localhost:3000'**. If you are running the project for the first time. There are no products saved yet also there wont be any user accounts available to you. So go ahead signup and save some products to use all other functionality of the website. <br>

7. To check what the data looks like in the database, Go to the newly installed [Atlas](https://www.mongodb.com/atlas/database) and follow the steps below.<br>
   a) Open the MongoDB Atlas and click on 'New Connection+' button on top left.<br>
   b) Enter the stored Link in the 'URI' section and click on connect.<br>
   c) If you have added some products into the database you will see 'shops' in the menu on the left side. Click on it to explore the different collections we have inserted in the database.<br>

8. All the media is stored in Cloudinary platform. To view all the media uploaded go the [Cloudinary website](https://cloudinary.com/) and follow the steps below.<br>
   a) Go to the Cloudinary Website.<br>
   b) After you Signin, you will see a Menu on the top. Search for 'Media Library' and click on it.<br>
   c) Here you will be able to see all the media uploaded by all the users under 'Assests' section.<br>

###### If you have any doubts regarding the installation of this project feel free to contact me and I'll help you get through the installation and running this project.

###### If you have any suggestions, please let me know :)
