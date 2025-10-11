// Firebase Cloud Messaging (FCM).

import { getFirebaseMessaging, isFirebaseReady } from '../config/firebase';

export interface FCMResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export class FCMService {

    /**
     * Send OTP via Firebase Cloud Messaging notification to user's device
     * @param fcmToken - FCM token of the target device
     * @param otp - OTP code to send in notification
     * @param phone - Phone number for context
     * @returns Promise<FCMResult> with success status and details
     */
    async sendOTPPushNotification(fcmToken: string, otp: string, phone: string): Promise<FCMResult> {
        try {
            // Check if Firebase is ready
            if (!isFirebaseReady()) {
                return {
                    success: false,
                    error: 'Firebase is not configured. Please set up Firebase first.'
                };
            }

            const messaging = getFirebaseMessaging();

            const message = {
                token: fcmToken,
                notification: {
                    title: 'AbiliLife Verification Code',
                    body: `Your verification code is: ${otp}`,
                },
                data: {
                    type: 'otp',
                    otp: otp,
                    phone: phone,
                    timestamp: new Date().toISOString(),
                },
                android: {
                    priority: 'high' as const,
                    notification: {
                        channelId: 'otp-notifications',
                        priority: 'high' as const,
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title: 'AbiliLife Verification Code',
                                body: `Your verification code is: ${otp}`,
                            },
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };

            const response = await messaging.send(message);
            console.log('(sendOTPPushNotification backend) ✅ FCM OTP notification sent successfully:', response);

            return {
                success: true,
                messageId: response,
            };
        } catch (error: any) {
            console.error('(sendOTPPushNotification backend) ❌ Error sending FCM OTP notification:', error);
            return {
                success: false,
                error: error.message || 'Unknown FCM error',
            };
        }
    }

    /**
     * Send general notification (for testing or future use)
     * @param fcmToken - FCM token
     * @param title - Notification title
     * @param body - Notification body
     * @param data - Additional data payload
     * @returns Promise<FCMResult>
     */
    async sendGeneralNotification(
        fcmToken: string,
        title: string,
        body: string,
        data?: Record<string, string>
    ): Promise<FCMResult> {
        try {
            if (!isFirebaseReady()) {
                return {
                    success: false,
                    error: 'Firebase is not configured. Please set up Firebase first.'
                };
            }

            const messaging = getFirebaseMessaging();

            const message = {
                token: fcmToken,
                notification: {
                    title,
                    body,
                },
                data: data || {},
                android: {
                    priority: 'normal' as const,
                    notification: {
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            alert: {
                                title,
                                body,
                            },
                            sound: 'default',
                        },
                    },
                },
            };

            const response = await messaging.send(message);
            console.log('(sendGeneralNotification backend) ✅ FCM general notification sent successfully:', response);

            return {
                success: true,
                messageId: response,
            };
        } catch (error: any) {
            console.error('(sendGeneralNotification backend) ❌ Error sending FCM general notification:', error);
            return {
                success: false,
                error: error.message || 'Unknown FCM error',
            };
        }
    }

    /**
     * Validate FCM token format (basic validation)
     * @param fcmToken - FCM token to validate
     * @returns boolean indicating if token format is valid
     */
    validateFCMToken(fcmToken: string): boolean {
        if (!fcmToken || typeof fcmToken !== 'string') {
            return false;
        }

        // Basic validation - FCM tokens are typically 163 characters long
        if (fcmToken.length < 100 || fcmToken.length > 200) {
            return false;
        }

        // Should not contain spaces or special characters except : and -
        const validTokenPattern = /^[A-Za-z0-9:_-]+$/;
        return validTokenPattern.test(fcmToken);
    }
}

export default FCMService;