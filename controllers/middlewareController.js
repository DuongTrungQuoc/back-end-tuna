const jwt = require("jsonwebtoken");

const middlewareController = {
  //verify token
  verifyToken: (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      //Bearer 102033
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json("Token is not valid!");
        }
        req.user = user;
        next();
      });
    } else {
      return res.status(401).json("You are not authenticated!");
    }
  },

  verifyTokenAndAdminAuth: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.admin) {
        next();
      } else {
        return res.status(403).json("You are not allowed to do that!");
      }
    });
  },
};

module.exports = middlewareController;
