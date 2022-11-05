const User = require("../models/user");
const { setAuthToken, verifyRefreshToken } = require("../utils/authToken");
const MESSAGES = require("../constants/messages");
const { applyPagination } = require("../utils/generalHelpers");

const userService = {
  getUserListing: async (req, res, next) => {
    const { keyword } = req.query;
    const users = await applyPagination(User.searchQuery(keyword), req.query);
    const count = await User.searchQuery(keyword).count();

    return res.status(200).json({
      success: true,
      count,
      users,
    });
  },
  registerUser: async (req, res, next) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: MESSAGES.EMAIL_ALREADY_REGISTERED,
      });
    }

    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error,
        message: MESSAGES.SERVER_ERROR,
      });
    }

    setAuthToken(user, 201, req, res, MESSAGES.REGISTRATION_SUCCESS);
  },
  loginUser: async (req, res, next) => {
    const { email, password } = req.body;

    let user;
    try {
      user = await User.findOne({
        email,
      }).select("+password");
    } catch (error) {
      return res.status(500).json({
        success: false,
        error,
        message: MESSAGES.SERVER_ERROR,
      });
    }

    try {
      const passwordIsCorrect = await user.comparePassword(password);

      user.reAuthenticate = false;
      await user.save();

      if (!passwordIsCorrect) {
        return res.status(200).json({
          success: false,
          message: MESSAGES.INCORRECT_PASSWORD,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        message: MESSAGES.SERVER_ERROR,
      });
    }

    await setAuthToken(user, 200, req, res, MESSAGES.LOGIN_SUCCESS);
  },
  getUserProfile: async (req, res) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  },
  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;
    try {
      const userId = await verifyRefreshToken(refreshToken);

      const user = await User.findById(userId);

      if (user.reAuthenticate) {
        return res.status(401).json({
          success: false,
          message: MESSAGES.LOGIN_REQUIRED,
        });
      }

      await setAuthToken(user, 200, req, res);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: MESSAGES.INVALID_REFRESH_TOKEN,
      });
    }
  },
  createUser: async (req, res) => {
    const { name, email, role, password } = req.body;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    try {
      const newUser = await User.create({
        name,
        email,
        role,
        password,
      });

      return res.status(200).json({
        success: true,
        message: MESSAGES.USER_CREATION_SUCCESS,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: MESSAGES.SERVER_ERROR,
      });
    }
  },
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const currentUser = req.user;
    const user = await User.findById(id);

    if (req.user._id !== id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: MESSAGES.INSUFFICIENT_PRIVILEGE,
      });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND,
      });
    }

    if (name) {
      user.name = name;
    }

    if (role && currentUser.role === "admin") {
      user.role = role;
    } else if (role && currentUser.role !== "admin") {
      return res.status(403).json({
        success: true,
        message: MESSAGES.INSUFFICIENT_PRIVILEGE,
      });
    }

    if (email) {
      user.email = email;
      user.reAuthenticate = true;
    }

    if (password && currentUser.role === "admin") {
      user.password = password;
      user.reAuthenticate = true;
    } else if (password && currentUser.role !== "admin") {
      return res.status(403).json({
        success: true,
        message: MESSAGES.INSUFFICIENT_PRIVILEGE,
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: MESSAGES.USER_UPDATED,
    });
  },
  deleteUser: async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: MESSAGES.USER_NOT_FOUND,
      });
    }

    await user.delete();

    return res.status(200).json({
      success: true,
      message: MESSAGES.USER_DELETED,
    });
  },
  getSingleUser: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: true,
          message: MESSAGES.USER_NOT_FOUND,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: MESSAGES.SERVER_ERROR,
      });
    }
  },
  logout: async (req, res) => {
    res.cookie("authorization", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    console.log("LOGGED OUT");

    res.status(200).json({
      success: true,
      message: MESSAGES.LOGOUT_SUCCESS,
    });
  },
};

module.exports = userService;
