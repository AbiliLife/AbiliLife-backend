import { getAuth, getFirestore, isFirebaseReady } from '../config/firebase';
import { User, CreateUserRequest, LoginRequest, OTPRequest, VerifyOTPRequest, AuthResponse, OTPResponse } from '../models/User';
import * as bcrypt from 'bcrypt';
import { FCMService } from './FCMService';

export class AuthService {
    private fcmService = new FCMService();

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

            // Hash password for secure storage
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Create user in Firebase Auth (without password since we'll handle it separately)
            const userRecord = await auth.createUser({
                email: userData.email,
                phoneNumber: userData.phone, // Might need to change key back to phone
                displayName: userData.fullName,
                emailVerified: false
            });

            // Create user document in Firestore with hashed password
            const userDoc: Partial<User> = {
                uid: userRecord.uid,
                email: userData.email,
                phone: userData.phone,
                fullName: userData.fullName,
                passwordHash: hashedPassword, // Store hashed password
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

            const firestore = this.getFirestoreService();

            // Get user document from Firestore by email
            const userQuery = await firestore
                .collection('users')
                .where('email', '==', loginData.email)
                .limit(1)
                .get();

            if (userQuery.empty) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            const userDoc = userQuery.docs[0];
            const userData = userDoc.data() as User;

            // Verify password using bcrypt
            if (!userData.passwordHash) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            const isPasswordValid = await bcrypt.compare(loginData.password, userData.passwordHash);

            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Generate custom token for authentication
            const auth = this.getAuthService();
            const customToken = await auth.createCustomToken(userData.uid);

            return {
                success: true,
                message: 'Login successful',
                user: {
                    uid: userData.uid,
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
    async sendOTP(otpData: OTPRequest): Promise<OTPResponse> {
        try {
            if (!isFirebaseReady()) {
                return {
                    success: false,
                    message: 'Firebase is not configured. Please set up Firebase first.'
                };
            }

            const firestore = this.getFirestoreService();

            // 1. Generate OTP
            const otp = this.generateOTP();

            // 2. Store OTP in Firestore with expiration
            await firestore.collection('otps').doc(otpData.phone).set({
                otp: otp,
                phone: otpData.phone,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
                verified: false,
                createdAt: new Date()
            });

            // 3. Send OTP via FCM notification (if user exists and has FCM token)
            const userQuery = await firestore.collection('users')
                .where('phone', '==', otpData.phone)
                .limit(1)
                .get();

            if (!userQuery.empty) {
                const userData = userQuery.docs[0].data();
                const fcmTokens = userData.fcmTokens || [];

                if (fcmTokens.length > 0) {
                    // Send to first available FCM token (simplified - one device per user)
                    const fcmResult = await this.fcmService.sendOTPPushNotification(fcmTokens[0], otp, otpData.phone);

                    if (fcmResult.success) {
                        return {
                            success: true,
                            message: 'OTP sent via push notification',
                            // Only return OTP in development for testing
                            ...(process.env.NODE_ENV === 'development' && { otp })
                        };
                    } else {
                        console.log('(sendOTP backend) ⚠️ FCM notification failed:', fcmResult.error);
                    }
                } else {
                    console.log('(sendOTP backend) ⚠️ No FCM tokens found for user:', otpData.phone);
                }
            } else {
                console.log('(sendOTP backend) ⚠️ No user found with phone:', otpData.phone, '(might be new user)');
            }

            // Fallback for development mode
            if (process.env.NODE_ENV === 'development') {
                console.log(`📱 OTP for development (${otpData.phone}): ${otp}`);
                return {
                    success: true,
                    message: 'OTP generated (check console - development mode)',
                    otp: otp
                };
            }

            // Production fallback when FCM fails
            return {
                success: false,
                message: 'Unable to deliver OTP. Please ensure you have the app installed and notifications enabled.'
            };

        } catch (error: any) {
            console.error('(sendOTP backend) ❌ Error in sendOTP:', error);
            return {
                success: false,
                message: error.message || 'Failed to send OTP'
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
