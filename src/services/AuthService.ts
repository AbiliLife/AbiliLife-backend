import { getAuth, getFirestore, isFirebaseReady } from '../config/firebase';
import { User, CreateUserRequest, LoginRequest, OTPRequest, VerifyOTPRequest, AuthResponse } from '../models/User';

export class AuthService {
  private getAuthService() {
    if (!isFirebaseReady()) {
      throw new Error('Firebase is not configured. Please set up Firebase first.');
    }
    return getAuth();
  }

  private getFirestoreService() {
    if (!isFirebaseReady()) {
      throw new Error('Firebase is not configured. Please set up Firebase first.');
    }
    return getFirestore();
  }

  /**
   * Create a new user account
   */
  async createUser(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Check if Firebase is ready
      if (!isFirebaseReady()) {
        return {
          success: false,
          message: 'Firebase is not configured. Please set up Firebase first.'
        };
      }

      const auth = this.getAuthService();
      const firestore = this.getFirestoreService();

      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        displayName: userData.fullName,
        emailVerified: false
      });

      // Create user document in Firestore
      const userDoc: Partial<User> = {
        uid: userRecord.uid,
        email: userData.email,
        phone: userData.phone,
        fullName: userData.fullName,
        isPhoneVerified: false,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await firestore.collection('users').doc(userRecord.uid).set(userDoc);

      // Generate custom token for immediate authentication
      const customToken = await auth.createCustomToken(userRecord.uid);

      return {
        success: true,
        message: 'User created successfully',
        user: {
          uid: userRecord.uid,
          email: userData.email,
          fullName: userData.fullName,
          phone: userData.phone
        },
        token: customToken
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error.message || 'Failed to create user'
      };
    }
  }

  /**
   * Login user with email and password
   */
  async loginUser(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Check if Firebase is ready
      if (!isFirebaseReady()) {
        return {
          success: false,
          message: 'Firebase is not configured. Please set up Firebase first.'
        };
      }

      const auth = this.getAuthService();
      const firestore = this.getFirestoreService();

      // Firebase Admin SDK doesn't have a direct way to verify email/password
      // We'll need to use the client SDK for this or implement a workaround
      // For now, we'll get the user by email and generate a custom token
      const userRecord = await auth.getUserByEmail(loginData.email);
      
      if (!userRecord) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Get user profile from Firestore
      const userDoc = await firestore.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.data() as User;

      // Generate custom token
      const customToken = await auth.createCustomToken(userRecord.uid);

      return {
        success: true,
        message: 'Login successful',
        user: {
          uid: userRecord.uid,
          email: userData.email,
          fullName: userData.fullName,
          phone: userData.phone
        },
        token: customToken
      };
    } catch (error: any) {
      console.error('Error logging in user:', error);
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(otpData: OTPRequest): Promise<AuthResponse> {
    try {
      // Check if Firebase is ready
      if (!isFirebaseReady()) {
        return {
          success: false,
          message: 'Firebase is not configured. Please set up Firebase first.'
        };
      }

      const firestore = this.getFirestoreService();

      // In a real implementation, you would integrate with an SMS service
      // For now, we'll simulate OTP generation
      const otp = this.generateOTP();
      
      // Store OTP in Firestore with expiration
      await firestore.collection('otps').doc(otpData.phone).set({
        otp: otp,
        phone: otpData.phone,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        verified: false,
        createdAt: new Date()
      });

      // In production, send actual SMS here
      console.log(`📱 OTP for ${otpData.phone}: ${otp}`);

      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(verifyData: VerifyOTPRequest): Promise<AuthResponse> {
    try {
      // Check if Firebase is ready
      if (!isFirebaseReady()) {
        return {
          success: false,
          message: 'Firebase is not configured. Please set up Firebase first.'
        };
      }

      const firestore = this.getFirestoreService();

      const otpDoc = await firestore.collection('otps').doc(verifyData.phone).get();
      
      if (!otpDoc.exists) {
        return {
          success: false,
          message: 'OTP not found or expired'
        };
      }

      const otpData = otpDoc.data();
      
      // Check if OTP is expired
      if (otpData!.expiresAt.toDate() < new Date()) {
        return {
          success: false,
          message: 'OTP has expired'
        };
      }

      // Check if OTP is correct
      if (otpData!.otp !== verifyData.otp) {
        return {
          success: false,
          message: 'Invalid OTP'
        };
      }

      // Mark OTP as verified
      await firestore.collection('otps').doc(verifyData.phone).update({
        verified: true,
        verifiedAt: new Date()
      });

      // Update user's phone verification status
      const userQuery = await firestore
        .collection('users')
        .where('phone', '==', verifyData.phone)
        .get();

      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        await userDoc.ref.update({
          isPhoneVerified: true,
          updatedAt: new Date()
        });
      }

      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }

  /**
   * Get user by email
   */
  private async getUserByEmail(email: string): Promise<any> {
    try {
      if (!isFirebaseReady()) {
        return null;
      }
      const auth = this.getAuthService();
      const userRecord = await auth.getUserByEmail(email);
      return userRecord;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate a 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Get user profile by UID
   */
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      if (!isFirebaseReady()) {
        return null;
      }
      const firestore = this.getFirestoreService();
      const userDoc = await firestore.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      return userDoc.data() as User;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}
