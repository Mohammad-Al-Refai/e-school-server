const client = require("mongodb").MongoClient;
const mongodb = require("mongodb");
require("dotenv").config();
const DB_NAME = "data";
const URL = process.env.DB_URL;
const mongo = client.connect(URL, { useNewUrlParser: true });
const { ComparePassword, HashPassword } = require("./auth/bcryptPassword");

mongo.catch((err) => {
  if (err) {
    console.log("Error     " + err);
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
            .insertOne({ name: name, email: email, password: result   , date:getDate(),})
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
              date:getDate(),
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
        date:getDate(),
      })
      .then((err) => {
        done(true);
      });
  });
}
function GetTeacherStudents(teacher_email, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("students")
      .find({ teacher: teacher_email })
      .toArray()
      .then((values) => {
        let result = [];
        if (values.length !== 0) {
          values.forEach((e) =>
            result.push({ _id: e._id, name: e.name, email: e.email })
          );
          done([true, result]);
        } else {
          done(false);
        }
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
        console.log(values)
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
function getStudentExam(student_id, done) {
  mongo.then((db) => {
    let result = [];
    db.db(DB_NAME)
      .collection("exams")
      .find({ _id: new mongodb.ObjectId(student_id) })
      .toArray()
      .then((values) => {
        if (values.length !== 0) {
          values.forEach((e) =>
            result.push({ exam_name: e.name, date: e.date })
          );
          done(values);
        } else {
          done(false);
        }
      });
  });
}
function getStudent(student_id, done) {
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("students")
      .find({ _id: new mongodb.ObjectId(student_id) })
      .toArray()
      .then((values) => {
        if (values.length !== 0) {
          done({name:values[0].name,email:values[0].email,date:values[0].date});
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
function getExamDetails(exam_id,done){
 
  mongo.then((db) => {
    db.db(DB_NAME)
      .collection("exams")
      .find({ _id: new mongodb.ObjectId(exam_id) })
      .toArray()
      .then((values) => {
     
        if (values.length !== 0) {
          let exam_details={name:values[0].name,mark:values[0].mark,questions:values[0].questions,date:values[0].date};
          mongo.then((db) => {
            db.db(DB_NAME)
              .collection("done_exams")
              .find({ exam_id:exam_id })
              .toArray()
              .then((students) => {
                console.log(students)
                if (values.length !== 0) {
                  done({exam:exam_details,students:students});
                } else {
                  done(false);
                }
              });
          });
        } else {
          done(false);
        }
      });
  });

}
function getDate(){
  let year=new Date().getFullYear()
  let month=new Date().getMonth()
  let day=new Date().getDay()
  return year+"/"+month+"/"+day
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
  GetTeacherStudents,
  getStudentExam,getStudent,getExamDetails
};
