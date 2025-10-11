import { getFirestore, isFirebaseReady, getFirebaseAdmin } from '../config/firebase';
import FCMService from '../services/FCMService';

export class FCMController {
    private fcmService = new FCMService();

    /**
     * Store FCM token for user
     */
    storeFCMToken = async (req: any, res: any): Promise<void> => {
        try {
            const { fcmToken, phone } = req.body;

            if (!fcmToken) {
                res.status(400).json({
                    success: false,
                    message: 'FCM token is required'
                });
                return;
            }

            if (!phone) {
                res.status(400).json({
                    success: false,
                    message: 'Phone number is required to associate FCM token'
                });
                return;
            }

            // Check if Firebase is ready
            if (!isFirebaseReady()) {
                res.status(500).json({
                    success: false,
                    message: 'Firebase is not configured. Please set up Firebase first.'
                });
                return;
            }

            const firestore = getFirestore();

            // Find user by phone number
            const userQuery = await firestore.collection('users')
                .where('phone', '==', phone)
                .limit(1)
                .get();

            if (userQuery.empty) {
                res.status(404).json({
                    success: false,
                    message: 'User not found with this phone number'
                });
                return;
            }

            const userDoc = userQuery.docs[0];
            const userId = userDoc.id;

            // Add token to user's FCM tokens array (support multiple devices)
            // Use arrayUnion to avoid duplicates
            const admin = getFirebaseAdmin();
            await firestore.collection('users').doc(userId).update({
                fcmTokens: admin.firestore.FieldValue.arrayUnion(fcmToken),
                lastTokenUpdate: new Date(),
            });

            console.log(`✅ FCM token stored for user ${phone}`);

            res.json({
                success: true,
                message: 'FCM token stored successfully'
            });
        } catch (error: any) {
            console.error('❌ Error storing FCM token:', error);
            res.status(500).json({
                success: false,
                message: `Failed to store FCM token: ${error.message}`
            });
        }
    };

    /**
     * Test FCM sending (development/admin endpoint)
     */
    testFCM = async (req: any, res: any): Promise<void> => {
        try {
            const { phone, message } = req.body;

            if (!phone) {
                res.status(400).json({
                    success: false,
                    message: 'Phone number is required'
                });
                return;
            }

            // Check if Firebase is ready
            if (!isFirebaseReady()) {
                res.status(500).json({
                    success: false,
                    message: 'Firebase is not configured. Please set up Firebase first.'
                });
                return;
            }

            const firestore = getFirestore();

            // Find user by phone number
            const userQuery = await firestore.collection('users')
                .where('phone', '==', phone)
                .limit(1)
                .get();

            if (userQuery.empty) {
                res.status(404).json({
                    success: false,
                    message: 'User not found with this phone number'
                });
                return;
            }

            const userData = userQuery.docs[0].data();
            const fcmTokens = userData.fcmTokens || [];

            if (fcmTokens.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'No FCM tokens found for this user'
                });
                return;
            }

            const testMessage = message || 'Test notification from AbiliLife backend';

            const results = [];
            for (const token of fcmTokens) {
                const result = await this.fcmService.sendGeneralNotification(
                    token,
                    'AbiliLife Test',
                    testMessage,
                    { type: 'test', timestamp: new Date().toISOString() }
                );
                results.push({ token: token.substring(0, 10) + '...', result });
            }

            res.json({
                success: true,
                message: 'Test notifications sent',
                tokenCount: fcmTokens.length,
                results
            });
        } catch (error: any) {
            console.error('❌ Error sending test FCM:', error);
            res.status(500).json({
                success: false,
                message: `Failed to send test FCM: ${error.message}`
            });
        }
    };
}