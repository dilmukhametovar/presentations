const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const passport = require('passport');
const UserController = require('../controllers/UserController');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const fsp = require('fs').promises;
const path = require('path');

/* get users listing. */
router.get('/', function(req, res) {
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'login page', message: null});
});

router.get('/list',
    ensureLoggedIn(),
    async (req, res, next) => {
  try {
    let list = req.user.pres;
    let username = req.user.username;
    res.render('list', {
      title: username + '\'s list',
      list: list
    });
  } catch (err) {
    next(err);
  }
});


router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'}), (req, res) => {
    res.redirect('/list');
  }
);

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'sign up page', message: null});
});

router.post('/signup', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  if (password == null) {
    return res.render('signup', {
      title: 'sign up page',
      messageClass: 'danger-alert',
      message: 'password is empty'
    });
  }
  if (password !== confirmPassword) {
    return res.render('signup', {
      title: 'sign up page',
      messageClass: 'danger-alert',
      message: 'passwords are not same'
    });
  }
  try {
    await UserController.createUser(username,password);
    passport.authenticate('local', {
      successfulRedirect: '/list'
    });
    res.render('login', {
      title: 'login page',
      messageClass: 'success-alert',
      message: 'Success! Now you can sign in.'
    });
  } catch (err) {
    res.render('signup', {
      title: 'sign up page',
      messageClass: 'danger-alert',
      message: 'Username is unavailable'
    });
  }
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.post('/create', ensureLoggedIn(), async (req, res, next) => {
  let name = req.body.name;
  if (name === '' || name == null) {
    next(createError(400));
  }
  try {
      let pres = req.user.pres;
      pres.push({name: name});
      let id = pres[pres.length-1].id;
      await req.user.save();
      let color = "#" + ((1 << 24) * Math.random() | 0).toString(16);
      await fsp.writeFile(path.join(__dirname, '..', 'pres', id + '.md'), '<!-- .slide: data-background="' + color + '" -->');
      res.redirect('/list');
  } catch (err) {
      next(err);
  }
});

router.get('/view', async (req, res, next) => {
    let id = req.query.id;
    try {
        let body = await fsp.readFile(path.join(__dirname, '..', 'pres', id+'.md'));
        res.render('pres.pug', {title: id, body: body});
    } catch(err) {
        next(err);
    }
});

router.post('/delete', ensureLoggedIn(), async (req, res, next) => {
    let id = req.body.id;
    let pres = req.user.pres.id(id);
    if (!pres) {
        next(createError(401));
    }
    try {
        pres.remove();
        await req.user.save();
        await fsp.unlink(path.join(__dirname, '..', 'pres', id + '.md'));
        res.redirect('/list');
    } catch (err) {
        next(err);
    }
});
router.post('/edit', ensureLoggedIn(), async (req, res, next) => {
    let id = req.body.id;
    if (!id) {
        next(createError(400));
    }
    if (!req.user.pres.id(id)) {
        next(createError(401));
    }
    try {
        let text = await fsp.readFile(path.join(__dirname, '..', 'pres', id+'.md'));
        res.render('edit', {title: 'edit page', id: id, text: text});
    } catch(err) {
        next(err);
    }
});
router.post('/save', ensureLoggedIn(), async (req, res, next) => {
    let id = req.body.id;
    let text = req.body.text;
    if (!req.user.pres.id(id)) {
        next(createError(401));
    }
    try {
        await fsp.writeFile(path.join(__dirname, '..', 'pres', id+'.md'), text);
        res.statusCode = 200;
        res.send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
