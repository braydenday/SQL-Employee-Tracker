// import required packages
const inquirer = require("inquirer");
const mysql = require("mysql2/promise");

require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;