const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Input validation
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password: hashedPassword,
        role 
      }])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'Email already exists' });
      }
      throw error;
    }

    // Generate JWT (without sensitive info)
    const token = jwt.sign(
      { 
        id: data[0].id, 
        role: data[0].role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return sanitized user data
    res.status(201).json({
      user: {
        id: data[0].id,
        email: data[0].email,
        role: data[0].role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return sanitized user data
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};