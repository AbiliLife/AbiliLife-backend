import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { CreateUserRequest, LoginRequest, OTPRequest, VerifyOTPRequest } from '../models/User';

export class AuthController {
  private authService = new AuthService();

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone, fullName, password }: CreateUserRequest = req.body;

      // Basic validation
      if (!email || !phone || !fullName || !password) {
        res.status(400).json({
          success: false,
          message: 'All fields are required: email, phone, fullName, password'
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
        return;
      }

      // Phone number validation (basic)
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number'
        });
        return;
      }

      // Password validation
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      const result = await this.authService.createUser({
        email,
        phone,
        fullName,
        password
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      const result = await this.authService.loginUser({ email, password });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  /**
   * Send OTP to phone number
   */
  sendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone }: OTPRequest = req.body;

      if (!phone) {
        res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
        return;
      }

      const result = await this.authService.sendOTP({ phone });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  /**
   * Verify OTP
   */
  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, otp }: VerifyOTPRequest = req.body;

      if (!phone || !otp) {
        res.status(400).json({
          success: false,
          message: 'Phone number and OTP are required'
        });
        return;
      }

      const result = await this.authService.verifyOTP({ phone, otp });

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  /**
   * Get current user profile
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // This would typically get the user ID from the authenticated token
      // For now, we'll expect it in the request parameters
      const { userId } = req.params;

      if (!userId || Array.isArray(userId)) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const user = await this.authService.getUserProfile(userId);

      if (user) {
        res.status(200).json({
          success: true,
          user
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
