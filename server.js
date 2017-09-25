// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Scrapping tools: Require request and cheerio.
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

/// Database configuration with mongoose
mongoose.connect("mongodb://localhost/week18day3mongoose");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Retrieve data from the db
app.get("/images", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/", function(req, res) {
    // First, we grab the body of the html with request
    request("https://www.vogue.com/fashion-shows/spring-2018-ready-to-wear", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      var results = [];

      // Now, we grab every h2 within an article tag, and do the following:
      $("div.carousel--item").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var imgLink = $(element).find("picture").find("source").attr("srcset");
      results.push({ link: imgLink });
    });
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
  });
});

// This will get the images we scraped from the mongoDB
app.get("/", function(req, res) {
  // Grab every doc in the Images array
  Image.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});
// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});