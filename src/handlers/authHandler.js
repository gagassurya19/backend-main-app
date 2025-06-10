  const bcrypt = require('bcrypt');
  const { generateToken, verifyToken, extractToken } = require('../utils/jwt');

  const register = async (request, h) => {
    try {
      const { email, password, fullName } = request.payload;
      const { prisma } = request;

      // Split fullName into firstName and lastName
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate userAlias and username from email or name
      const emailPrefix = email.split('@')[0];
      const userAlias = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/\s+/g, '') || emailPrefix;
      const username = emailPrefix;

      // Check if user already exists
      const existingUser = await prisma.userProfile.findUnique({
        where: { email }
      });

      if (existingUser) {
        return h.response({
          status: 'fail',
          message: 'Email already registered'
        }).code(400);
      }

      // Generate unique userAlias and username
      let finalUserAlias = userAlias;
      let finalUsername = username;
      let counter = 1;

      // Check and ensure userAlias is unique
      while (true) {
        const existingUserAlias = await prisma.userProfile.findUnique({
          where: { userAlias: finalUserAlias }
        });
        if (!existingUserAlias) break;
        finalUserAlias = `${userAlias}${counter}`;
        counter++;
      }

      counter = 1; // Reset counter for username
      // Check and ensure username is unique
      while (true) {
        const existingUsername = await prisma.userProfile.findUnique({
          where: { username: finalUsername }
        });
        if (!existingUsername) break;
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.userProfile.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          userAlias: finalUserAlias,
          username: finalUsername
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userAlias: true,
          username: true,
          createdAt: true
        }
      });

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      return h.response({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      }).code(201);
    } catch (error) {
      console.error('Register error:', error);
      return h.response({
        status: 'error',
        message: 'Internal server error'
      }).code(500);
    }
  };

  const login = async (request, h) => {
    try {
      const { email, password } = request.payload;
      const { prisma } = request;

      // Find user
      const user = await prisma.userProfile.findUnique({
        where: { email }
      });

      if (!user) {
        return h.response({
          status: 'fail',
          message: 'Invalid email or password'
        }).code(401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return h.response({
          status: 'fail',
          message: 'Invalid email or password'
        }).code(401);
      }

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return h.response({
        status: 'success',
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        }
      }).code(200);
    } catch (error) {
      console.error('Login error:', error);
      return h.response({
        status: 'error',
        message: 'Internal server error'
      }).code(500);
    }
  };

  const refresh = async (request, h) => {
    try {
      const authHeader = request.headers.authorization;
      const token = extractToken(authHeader);
      const decoded = verifyToken(token);

      const { prisma } = request;
      
      // Verify user still exists
      const user = await prisma.userProfile.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userAlias: true,
          username: true
        }
      });

      if (!user) {
        return h.response({
          status: 'fail',
          message: 'User not found'
        }).code(404);
      }

      // Generate new token
      const newToken = generateToken({ userId: user.id, email: user.email });

      return h.response({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
          user,
          token: newToken
        }
      }).code(200);
    } catch (error) {
      console.error('Refresh token error:', error);
      return h.response({
        status: 'fail',
        message: 'Invalid or expired token'
      }).code(401);
    }
  };

  module.exports = {
    register,
    login,
    refresh
  };

