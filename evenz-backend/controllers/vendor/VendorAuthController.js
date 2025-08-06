// File: controllers/vendor/VendorAuthController.js 
const Vendor = require('../../models/Vendor/Vendor');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { identifier, password, rememberMe = false } = req.body;

        const vendor = await Vendor.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        }).select('+password');

        // --- STEP 2: LOG THE FOUND VENDOR'S ID ---
        if (!vendor) {
            return res.status(401).json({ message: 'Vendor not found. Please create an account to continue.' });
        }

        const isMatch = await vendor.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        

        if (vendor.status !== 'active') {
            return res.status(403).json({ message: `Your account is currently ${vendor.status}. Please contact support.` });
        }
        
        // --- STEP 3: LOG THE ID RIGHT BEFORE CREATING THE TOKEN ---
        

        const accessToken = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: vendor._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: rememberMe ? '60d' : '1d' });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        };
        
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: (rememberMe ? 60 : 1) * 24 * 60 * 60 * 1000 });
        
        res.status(200).json({
            message: 'Login successful',
            accessToken,
            vendor: {
                _id: vendor._id,
                businessName: vendor.businessName,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};


const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.sendStatus(401); // Unauthorized
    }

    const refreshToken = cookies.refreshToken;

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const vendor = await Vendor.findById(decoded.id);
        if (!vendor) {
            return res.sendStatus(403); // Forbidden
        }

        // Issue a new short-lived access token
        const accessToken = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        res.json({ accessToken });

    } catch (err) {
        // If refresh token is expired or invalid
        return res.sendStatus(403); // Forbidden
    }
};

const handleLogout = (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.sendStatus(204); // No content
    }

    // Clear the secure cookie
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ message: 'Cookie cleared' });
};

// ... other exports
module.exports = { login, handleRefreshToken, handleLogout };