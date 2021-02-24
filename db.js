const client = require("mongodb").MongoClient;
const mongodb = require("mongodb");
require('dotenv').config()
const DB_NAME = "data";
// const URL = `mongodb+srv://root:5VlAhsxJrzh5OCXT@cluster0.3fdnv.mongodb.net/${DB_NAME}?authSource=admin`;
const URL=process.env.DB_URL
const mongo = client.connect(URL, { useNewUrlParser: true });
const { ComparePassword, HashPassword } = require("./auth/bcryptPassword");
mongo.catch((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Mongodb is Connected");
  }
});

function RegisterTeacher(name, email, password, done) {
  IsExist("teachers", email, (exist) => {
    if (exist === false) {
      HashPassword(password, (result) => {
        mongo.then((db) => {
          db.db(DB_NAME)
            .collection("teachers")
            .insertOne({ name: name, email: email, password: result })
            .then((err) => {
              done(true);
            });
        });
      });
    } else {
      done(false);
    }
  });
}

function LoginTeacher(email, password, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("teachers")
      .find({ email: email })
      .toArray()
      .then((values) => {
        if (values.length !== 0) {
          ComparePassword(password, values[0].password, (result) => {
            if (result) {
              done([true, values[0].name]);
            } else {
              done([false]);
            }
          });
        } else {
          done([false]);
        }
      });
  });
}
function RegisterStudent(teacher_email, name, email, pin, done) {
  IsExist("students", email, (exist) => {
    if (exist === false) {
      HashPassword(pin, (result) => {
        mongo.then((db) => {
          db.db(DB_NAME)
            .collection("students")
            .insertOne({
              name: name,
              email: email,
              pin: result,
              teacher: teacher_email,
            })
            .then((err) => {
              done(true);
            });
        });
      });
    } else {
      done(false);
    }
  });
}
function LoginStudent(email, pin, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("students")
      .find({ email: email })
      .toArray()
      .then((values) => {
        if (values.length !== 0) {
          ComparePassword(pin, values[0].pin, (result) => {
            if (result) {
              done([true, values[0].name]);
            } else {
              done([false]);
            }
          });
        } else {
          done([false]);
        }
      });
  });
}

function ChangePasswordStudent(old_pin, email, user_email, new_pin, done) {
  IsExist("teachers", email, (state) => {
    if (state) {
      GetPassword("students", user_email, (isExist) => {
        if (isExist[0]) {
          ComparePassword(new_pin, isExist[1], (res) => {
            if (res) {
              done(false);
            } else {
              ComparePassword(old_pin, isExist[1], (result) => {
                if (result) {
                  HashPassword(new_pin, (hash_pin) => {
                    console.log(hash_pin);
                    mongo.then((db) => {
                      db.db(DB_NAME)
                        .collection("students")
                        .updateOne(
                          { email: user_email },
                          { $set: { pin: hash_pin } }
                        )
                        .then((value) => {
                          done(true);
                        });
                    });
                  });
                } else {
                  done(false);
                }
              });
            }
          });
        } else {
          done(false);
        }
      });
    } else {
      done(false);
    }
  });
}

function GetPassword(table, email, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection(table)
      .find({ email: email })
      .toArray()
      .then((values) => {
        if (values.length !== 0) {
          done([true, values[0].pin]);
        } else {
          done(false);
        }
      });
  });
}
function updateNameStudent(teacher_email, email, new_name, done) {
  console.log(teacher_email);
  IsExist("teachers", teacher_email, (isExist) => {
    if (isExist) {
      IsExist("students", email, (isStudent) => {
        if (isStudent) {
          mongo.then((db) => {
            db.db(DB_NAME)
              .collection("students")
              .updateOne({ email: email }, { $set: { name: new_name } })
              .then((value) => {
                done(true);
              });
          });
        } else {
          done(false);
        }
      });
    } else {
      done(false);
    }
  });
}
function DeleteStudent(email, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("students")
      .deleteOne({ email: email }, (err, res) => {
        if (err) {
          console.log(err);
          done(false);
        } else {
          done(true);
        }
      });
  });
}
function CreateExam(teacher_email, data, done) {
  let exam_name = data.exam_name;
  let exam_end_mark = data.exam_end_mark;
  let questions = data.exam_questions;

  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("exams")
      .insertOne({
        name: exam_name,
        mark: exam_end_mark,
        questions: questions,
        teacher: teacher_email,
      })
      .then((err) => {
        done(true);
      });
  });
}
function GetTeacherExams(teacher_email, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("exams")
      .find({ teacher: teacher_email })
      .toArray()
      .then((values) => {
        console.log(values);
        if (values.length !== 0) {
          done([true, values]);
        } else {
          done(false);
        }
      });
  });
}
function IsExist(table, email, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection(table)
      .find({ email: email })
      .toArray()
      .then((values) => {
        if (values.length !== 0) {
          done(true);
        } else {
          done(false);
        }
      });
  });
}
function DeleteExam(exam_id, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("exams")
      .deleteOne({ _id: new mongodb.ObjectId(exam_id) }, (err, res) => {
        if (err) {
          console.log(err);
          done(false);
        } else {
          done(true);
        }
      });
  });
}
module.exports = {
  RegisterTeacher,
  LoginTeacher,
  RegisterStudent,
  LoginStudent,
  ChangePasswordStudent,
  updateNameStudent,
  DeleteStudent,
  CreateExam,
  GetTeacherExams,
  DeleteExam,
};
