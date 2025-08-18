import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader';
import globalStyles from '../../utilities/constants/globalStyles';
import Colors from '../../utilities/constants/colors';
import { Gallery, NewChatIcon, SendIcon } from '../../assets/icons';
import CustomText from '../../components/CustomText';
import ViewMessageUser from '../../components/ViewMessageUser';
import ViewMessageAdmin from '../../components/ViewMessageAdmin';
import { IS_IOS, Typography, wp, } from '../../utilities/constants/constant.style';
import CustomTextField from '../../components/CustomTextField';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../types/types';
import { firebase } from '@react-native-firebase/auth';
import auth from '@react-native-firebase/auth';
import { resetUnseenCount, setUnseenCount } from '../../store/slices/chatSlice';
import useKeyboardVisibility from '../../services/hooks/useKeyboardVisibility';

interface MessageType {
    id: number;
    sender: 'user' | 'admin';
    msg?: string;
    timestamp: string;
    type: 'text' | 'image' | 'video';
    mediaUri?: string;
}

const SupportScreen = () => {
    const flatListRef = useRef(null);
    const dispatch = useDispatch();

    const [messages, setMessages] = useState([]);
    const [typedMsg, setTypedMsg] = useState('');
    const [chatId, setChatId] = useState(null);
    const [chatStatus, setChatStatus] = useState('open');
    const [loading, setLoading] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    const { isKeyboardVisible } = useKeyboardVisibility();
    const userId = useSelector((state: RootState) => state?.auth?.user?.userId);
    let unsubscribe: (() => void) | null = null;

    const MESSAGES_PER_PAGE = 15;
    const [userProfile, setUserProfile] = useState('');

    useEffect(() => {
        if (!chatId) return;

        const unsubscribeUnseen = firebase.firestore()
            .collection('support_chats')
            .doc(chatId)
            .collection('messages')
            .where('senderType', '==', 'agent')
            .where('seen', '==', false)
            .onSnapshot(snapshot => {
                dispatch(setUnseenCount(snapshot.size));
            });

        return () => {
            unsubscribeUnseen();
            // Reset count when leaving the screen if you want
            dispatch(resetUnseenCount());
        };
    }, [chatId, dispatch]);

    useEffect(() => {
        const user = auth().currentUser;
        if (user) {
            setUserProfile(user.photoURL || 'No photo');
        }
        checkExistingChat();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const checkExistingChat = async () => {
        try {
            const snapshot = await firebase.firestore()
                .collection('support_chats')
                .where('userId', '==', userId)
                .where('status', '==', 'open')
                .limit(1)
                .get();

            if (!snapshot.empty) {
                const chatDoc = snapshot.docs[0];
                setChatId(chatDoc.id);
                setChatStatus(chatDoc.data().status);
                loadInitialMessages(chatDoc.id);
            } else {
                await createNewChat();
            }
        } catch (error) {
            console.log('Error checking for existing chat:', error);
        }
    };

    const createNewChat = async () => {
        try {
            const newChatRef = await firebase.firestore().collection('support_chats').add({
                userId: userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'open',
                assignedTo: null
            });

            setChatId(newChatRef.id);
            loadInitialMessages(newChatRef.id);
        } catch (error) {
            console.log('Error creating new chat:', error);
        }
    };

    const loadInitialMessages = (chatId: string) => {
        const messagesRef = firebase.firestore()
            .collection('support_chats')
            .doc(chatId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(MESSAGES_PER_PAGE);

        unsubscribe = messagesRef.onSnapshot(snapshot => {
            // Don't update if we're currently sending a message
            if (isSendingMessage) return;

            if (snapshot.empty) {
                setMessages([]);
                setInitialLoad(false);
                setHasMoreMessages(false);
                setIsFirstLoad(false);
                return;
            }

            const loadedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    msg: data.text,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    sender: data.senderType === 'user' ? 'user' : 'agent',
                    type: 'text',
                    seen: data.seen || false
                };
            }).reverse();

            setMessages(loadedMessages);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setInitialLoad(false);
            setHasMoreMessages(snapshot.docs.length === MESSAGES_PER_PAGE);

            // Only scroll to bottom on first load
            if (isFirstLoad && flatListRef.current && loadedMessages.length > 0) {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                }, 500);
                setIsFirstLoad(false);
            }
        }, error => {
            console.log('Error loading messages:', error);
            setInitialLoad(false);
            setIsFirstLoad(false);
        });
    };

    const loadMoreMessages = async () => {
        if (!chatId || !lastDoc || loadingMore || !hasMoreMessages || isSendingMessage) return;

        setLoadingMore(true);
        try {
            const messagesRef = firebase.firestore()
                .collection('support_chats')
                .doc(chatId)
                .collection('messages')
                .orderBy('timestamp', 'desc')
                .startAfter(lastDoc)
                .limit(MESSAGES_PER_PAGE);

            const snapshot = await messagesRef.get();

            if (snapshot.empty) {
                setHasMoreMessages(false);
                setLoadingMore(false);
                return;
            }

            const newMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    msg: data.text,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    sender: data.senderType === 'user' ? 'user' : 'agent',
                    type: 'text',
                    seen: data.seen || false
                };
            }).reverse();

            // Add older messages to the beginning of the array
            setMessages(prev => [...newMessages, ...prev]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMoreMessages(snapshot.docs.length === MESSAGES_PER_PAGE);
        } catch (error) {
            console.log('Error loading more messages:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScrollToTop = () => {
        if (!loadingMore && hasMoreMessages && !isFirstLoad && !isSendingMessage) {
            loadMoreMessages();
        }
    };

    const handleSend = async () => {
        if (!typedMsg.trim() || !chatId || isSendingMessage) return;

        const messageText = typedMsg.trim();
        setTypedMsg('');
        setIsSendingMessage(true);

        try {
            setLoading(true);

            // Create optimistic message
            const optimisticMessage = {
                id: `temp_${Date.now()}`,
                msg: messageText,
                timestamp: new Date(),
                sender: 'user',
                type: 'text',
                seen: false
            };

            // Add optimistic message to UI
            setMessages(prev => [...prev, optimisticMessage]);

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

            // Send to Firestore
            const newMessage = {
                senderId: userId,
                senderType: 'user',
                text: messageText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                seen: false
            };

            await firebase.firestore()
                .collection('support_chats')
                .doc(chatId)
                .collection('messages')
                .add(newMessage);

            setTimeout(() => {
                setIsSendingMessage(false); // Allow listener to work again
            }, 1000); // Small delay to ensure Firestore has processed

            await markMessagesAsSeen();
        } catch (error) {
            console.log('Error sending message:', error);
            // Rollback optimistic update on error
            setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
            setTypedMsg(messageText); // Restore the message
            setIsSendingMessage(false);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsSeen = async () => {
        if (!chatId) return;

        try {
            const messagesRef = firebase.firestore()
                .collection('support_chats')
                .doc(chatId)
                .collection('messages');

            const snapshot = await messagesRef
                .where('senderType', '==', 'agent')
                .where('seen', '==', false)
                .get();

            const batch = firebase.firestore().batch();
            snapshot.forEach(doc => {
                batch.update(doc.ref, { seen: true });
            });

            await batch.commit();
        } catch (error) {
            console.log('Error marking messages as seen:', error);
        }
    };

    const renderItem = ({ item }) => {
        if (item.sender === 'user') {
            return (
                <ViewMessageUser
                    message={item.msg}
                    timestamp={item.timestamp}
                    type={item.type}
                    style={undefined}
                />
            );
        } else {
            return (
                <ViewMessageAdmin
                    message={item.msg}
                    timestamp={item.timestamp}
                    type={item.type}
                />
            );
        }
    };

    const RightContainer = () => {
        return (
            <View style={styles.iconsContainer}>
                {loading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleSend}
                        disabled={isSendingMessage}
                    >
                        <SendIcon />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, }}
            behavior={IS_IOS ? 'padding' : 'height'}
        >
            <View style={globalStyles.mainContainer}>
                <HomeProfessionalHeader title="Support" backIcon={false} />
                <View style={[globalStyles.paddingContainer, styles.body]}>
                    <View style={globalStyles.Imgcontainer}>
                        <View style={globalStyles.initialsContainer}>
                            <CustomText style={globalStyles.initialsText}>S</CustomText>
                        </View>

                        <View style={globalStyles.messageContent}>
                            <CustomText style={globalStyles.adminLabel}>Admin</CustomText>
                            <CustomText style={globalStyles.description}>
                                How can we help you today?
                            </CustomText>
                        </View>
                    </View>

                    {messages.length === 0 && !initialLoad ? (
                        <View style={{ gap: 6, alignItems: 'center', width: "100%" }}>
                            <View style={{ marginBottom: 12 }}>
                                <NewChatIcon />
                            </View>
                            <CustomText style={styles.title}>New Chat</CustomText>
                            <CustomText style={[globalStyles.description, { textAlign: 'center' }]}>
                                Do you have any questions for us today?
                            </CustomText>
                        </View>
                    ) : (
                        <FlatList
                            style={{ width: '100%', flex: 1, }}
                            contentContainerStyle={{ flexGrow: 1, width: "100%" }}
                            keyboardShouldPersistTaps="always"
                            data={messages}
                            keyExtractor={item => item.id}
                            renderItem={renderItem}
                            ref={flatListRef}
                            inverted={false}
                            onScroll={({ nativeEvent }) => {
                                // Don't trigger during first load or while sending message
                                if (isFirstLoad || isSendingMessage) return;

                                const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
                                const isNearTop = contentOffset.y <= 50;

                                if (isNearTop && !loadingMore && hasMoreMessages) {
                                    handleScrollToTop();
                                }
                            }}
                            scrollEventThrottle={16}
                            ListHeaderComponent={
                                loadingMore ? (
                                    <View style={{ padding: 10, alignItems: 'center' }}>
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    </View>
                                ) : null
                            }
                            maintainVisibleContentPosition={{
                                minIndexForVisible: 0,
                                autoscrollToTopThreshold: 10
                            }}
                            initialScrollIndex={0}
                        />
                    )}

                    {/* Input Bar */}
                    <CustomTextField
                        placeholder="Type your message..."
                        value={typedMsg}
                        onChangeText={setTypedMsg}
                        right={<RightContainer />}
                        inputContainerStyle={{ borderRadius: 12, marginBottom: isKeyboardVisible ? 30 : wp * 0.01 }}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};
export default SupportScreen;

const styles = StyleSheet.create({
    title: { color: Colors.primary, ...Typography.f_17_nunito_bold, textAlign: 'center' },
    body: {
        justifyContent: 'space-between',
        flexGrow: 1,
        alignItems: 'center',
        gap: 36,
    },
    iconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },


})