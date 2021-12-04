
// Importing node tools
const express = require('express');
const path = require('path');
const fs = require('fs');
// random number equation generator from npm 
const { v4: uuidv4 } = require('uuid');

// Decalring port where server is located
const app = express();
const PORT = process.env.PORT || 3001;

/* This tells the router to pass requests through
these middlewares - the request is being parsed and 
encoded - the index.js file in the public directory
states that the requests come from the root directory 
of /api - so this is where all of the requests will
begin. This is basically the same thing we did in 
project 2*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// tells server to look at public folder to load files

app.use(express.static('./public'));

/* laying out the logic for how the server should
communicate with the JSON database and pull the note 
information and display it - so if a get request
is sent to the root route or note route, it will 
respond by sending the corresponding HTML file to 
the requests listed below*/

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});


app.get('/notes', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

/* So now we need to make our routes to the actual 
requests into our fake database - we need the ability
to see all of the data in the JSON file, update it, 
and also delete it - when we make a deletion, we have to
invoke the correct id of the corresponding entry */

/* when the get request is received, the JSON file data is made into a 
JavaScript Object and sent back as a response - the public/js/notes.html takes
care of the rendering */

app.get('/api/notes', function (req, res) {
    // need to parse stored JSON data from buffer and then to a JS object
    let string = fs.readFileSync('./db/db.json');
    let parsed = JSON.parse(string.toString())
    res.send(parsed);
});



app.post('/api/notes', function (req, res) {
    // if a post request body contains anything...
    if (req.body) {
        // Set its contents to these corresponding values
        let noteData = {
            id: uuidv4(),
            title: req.body.title,
            text: req.body.text,
        }

        fs.readFile('./db/db.json', function (err, data) {
            /*turning data into a workable object, and then
            adding it to the end of the array that is our stored
            JSON data using fs node - if it doesn't work it 
            reads an error on the console*/
            let addition = JSON.parse(data);
            addition.push(noteData);
            fs.writeFile('./db/db.json', JSON.stringify(addition), function (error) {
                console.log(error, "Your Note Has Been Saved!")
            })
        })
    }
})
/*If a delete request is sent to the server - it reads the JSON file of the
corresponding id (it is desctructured here), then filters it - 
if the ID of a note is not the note selected to be deleted, it remains in the array of 
our stored data, otherwise it is removed*/ 
app.delete('/api/notes/:id', function (req, res) {
    fs.readFile('./db/db.json', function (err, data) {
        let removed = JSON.parse(data);
        let { id } = req.params;
        let filteredremoved = removed.filter(function (note) {
            return note.id !== id
        })    
        fs.writeFile('./db/db.json', JSON.stringify(filteredremoved), function (error) {
            console.log(error, "Your Note Has Been Deleted!")
        })
    })
});

/* Telling server to listen at this port - if it 
doesn't work the console will display the error
this is for localhost testing*/
app.listen(PORT, () =>
    console.log('Now listening to Server')
);