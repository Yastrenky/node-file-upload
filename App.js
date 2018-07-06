// RUN PACKAGES
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const nodeMailer = require('nodemailer');
var mkdirp = require('mkdirp');

// SETUP APP
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/public'));



//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {

  //specify diskStorage (another option is memory)
  storage: multer.diskStorage({

    //specify destination
    destination: function (req, file, next) {
      var dir_name = Date.now();
      mkdirp('./public/' + dir_name, function (err) {
        if (err) {
          console.error(err)
        } else {
          console.log('-------------directory created----------')
          next(null, './public/' + dir_name);
        }
      });
    },

    //specify the filename to be unique
    filename: function (req, file, next) {
      next(null, file.originalname.replace(/\s/g, '-'));
    }
  }),

  // filter out and prevent non-image files.
  fileFilter: function (req, file, next) {
    if (!file) {
      next();
    }

    // only permit image mimetypes
    const doc = file.mimetype.endsWith('/msword');
    const docx = file.mimetype.endsWith('/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const pdf = file.mimetype.endsWith('/pdf');

    if (doc || docx || pdf) {
      console.log('doc uploaded');
      next(null, true);
    } else {
      console.log("file not supported")
      //TODO:  A better message response to user on failure.
      return next();
    }
  }
};


/* ROUTES
**********/
app.get('/', function (req, res) {
  res.render('index.html');
});

app.post('/upload', multer(multerConfig).single('file-to-upload'), function (req, res) {
  console.log("File path", req.file.path.replace(/\\/g, "/"));

  var transport = {
    service: 'gmail',
    auth: {
      user: 'yaytest02@gmail.com',
      pass: 'asdfghjklzxcvbnm'
    }
  };

  var transporter = nodeMailer.createTransport(transport);

  transporter.sendMail({
    from: "attachment-test@yahoo.com",
    to: "ybramos91@gmail.com",
    subject: "pure test",
    html: "hello test",
    attachments: {   // filename and content type is derived from path
      path: './' + req.file.path.replace(/\\/g, "/")
    }
  }, function (err, info) {
    if (err) {
      console.log(err);
      return res.status(500).end(err);
    }
    console.log(info);
    res.json(info);
    // res.redirect('/thank.html');
  });

  res.redirect('./#allok');


}

);

// RUN SERVER
app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
