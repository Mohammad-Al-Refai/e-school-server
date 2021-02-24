const express = require("express");
const route = express.Router();
require('dotenv').config()
const db = require("./db");
const jwt = require("./auth/token");
//Register For teacher
route.route("/tech/register").post((req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  db.RegisterTeacher(name, email, password, (isDone) => {
    if (isDone) {
      res.send({
        state: true,
        token: jwt.createToken({ name: name, email: email }),
      });
    } else {
      res.send({ state: false, msg: "Email is Exist" });
    }
  });
});
route.route("/tech/login").post((req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  db.LoginTeacher(email, password, (result) => {
    console.log(result);
    if (result[0]) {
      res.send({
        state: true,
        token: jwt.createToken({ name: result[1], email: email }),
      });
    } else {
      res.send({ state: false, msg: "Error in auth" });
    }
  });
});
route.route("/tech/add/student").post((req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  let name = req.body.name;
  let email = req.body.email;
  let pin = req.body.pin;
  jwt.readToken(token, (result) => {
    if (result.state) {
      db.RegisterStudent(result.data.email, name, email, pin, (done) => {
        done == false
          ? res.send({ state: false, msg: "Email is Exist" })
          : res.send({
              state: true,
              msg: "ok",
              token: jwt.createToken({ name: name, email: email }),
            });
      });
    } else {
      res.send({ state: false, msg: "error" });
    }
  });
});
route.route("/student/login").post((req, res) => {
  let email = req.body.email;
  let pin = req.body.pin;
  db.LoginStudent(email, pin, (result) => {
    console.log(result);
    if (result[0]) {
      res.send({
        state: true,
        token: jwt.createToken({ name: result[1], email: email }),
      });
    } else {
      res.send({ state: false, msg: "Error in auth" });
    }
  });
});
route.route("/tech/password/student").post((req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  let old_password = req.body.old_password;
  let new_password = req.body.new_password;
  let user_email = req.body.user_email;
  jwt.readToken(token, (result) => {
    if (result.state) {
      db.ChangePasswordStudent(
        old_password,
        result.data.email,
        user_email,
        new_password,
        (done) => {
          if (done) {
            res.send({ state: true, msg: "your password is updated" });
          } else {
            res.send({ state: false, msg: "Error in auth" });
          }
        }
      );
    } else {
      res.send({ state: false, msg: "Error in auth" });
    }
  });
});
route.route("/tech/edit_name/student").post((req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  let email = req.body.email;
  let new_name = req.body.new_name;
  jwt.readToken(token, (values) => {
    if (values.state) {
      db.updateNameStudent(values.data.email, email, new_name, (done) => {
        if (done) {
          res.send({ state: true, msg: "done" });
        } else {
          res.send({ state: false, msg: "Error in auth" });
        }
      });
    } else {
      res.send({ state: false, msg: "Error in auth" });
    }
  });
});
route.route("/tech/delete/student").delete((req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  let email = req.body.email;
  jwt.readToken(token, (values) => {
    if (values.state) {
      db.DeleteStudent(email, (done) => {
        if (done) {
          res.send({ state: true, msg: "done" });
        } else {
          res.send({ state: false, msg: "Error in Student Email" });
        }
      });
    } else {
      res.send({ state: false, msg: "Error in auth" });
    }
  });
});
route.route("/tech/add/exam").post((req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  let exam = req.body.exam;
  jwt.readToken(token, (values) => {
    if (values.state) {
      console.log(exam);
      db.CreateExam(values.data.email, exam, (done) => {
        if (done) {
          res.send({ state: true, msg: "created" });
        } else {
          res.send({ state: false, msg: "Error when create exam" });
        }
      });
    } else {
      res.send({ state: false, msg: "Error in auth" });
    }
  });
});
route.route("/tech/get-all/exams").get((req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  jwt.readToken(token, (values) => {
    if (values.state) {
      db.GetTeacherExams(values.data.email, (data) => {
        res.send({ state: true, msg: "ok", data: data });
      });
    } else {
      res.send({ state: false, msg: "Error in auth" });
    }
  });
});
route.route("/tech/delete/exam").delete((req, res) => {
  let token = req.headers.authorization.split(" ")[1];
  let exam_id = req.body.id;
  jwt.readToken(token, (values) => {
    if (values.state) {
      db.DeleteExam(exam_id, (done) => {
        res.send({ state: true, msg: exam_id + " is deleted" });
      });
    } else {
      res.send({ state: false, msg: "Error in auth" });
    }
  });
});

module.exports = route;
