const { registerValidation } = require("../middleware/validation");
const db = require("../database/db");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

exports.registerUser = async (params) => {
  const { error } = registerValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { fullName, email, password } = params;
  const hashedPassword = md5(password.toString());

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT email FROM users WHERE email = ?`,
      [email],
      (err, result) => {
        if (result.length > 0) {
          reject({
            message: "Email address is in use, please try a different one",
            statusCode: 400,
          });
        } else if (result.length === 0) {
          db.query(
            `INSERT INTO users (full_name, email, password) VALUES (?,?,?)`,
            [fullName, email, hashedPassword],
            (err, result) => {
              if (err) {
                reject({
                  message: "Something went wrong, please try again",
                  statusCode: 400,
                  err,
                });
              } else {
                const token = jwt.sign({ data: result }, "secret");
                resolve({
                  data: result,
                  message: "You have successfully registered.",
                  token: token,
                  statusCode: 200,
                });
              }
            }
          );
        }
      }
    );
  });
};
