const bcrypt = require('bcrypt');
const { generateToken, verifyToken, extractToken } = require('../utils/jwt');

const register = async (request, h) => {
  try {
    const { email, password, fullName } = request.payload;
    const { prisma } = request;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return h.response({
        status: 'fail',
        message: 'Email already registered'
      }).code(400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName
      },
      select: {
        id: true,
        email: true,
        fullName: true,
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
    const user = await prisma.user.findUnique({
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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true
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

