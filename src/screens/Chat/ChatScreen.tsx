import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { authFetch } from '../../utils/authFetch';
import { API_URL } from '../../config/api';
import { Icons } from '../../constants/icons';
import {
  SendIcon,
  PhoneCallIcon,
  ChatBubbleIcon,
} from '../../components/icons';
import { wsService, ChatSocketMessage } from '../../services/WebSocketService';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface MessageItem {
  _id?: string;
  id?: string;
  orderId: string;
  sender: string | { _id: string; name: string };
  senderName: string;
  senderRole: 'customer' | 'shopkeeper' | 'delivery_man' | 'admin';
  recipient?: string;
  recipientRole?: string;
  message: string;
  createdAt: string;
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const { userId, userProfile, role } = useUser();
  const { showToast } = useToast();

  const { orderId, orderNumber, recipientId, recipientName, recipientRole } = route.params;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const activeUserId = (userId || userProfile?.id || userProfile?._id || '').toString();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/chat/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch chat messages:', e);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time incoming chat listener
  useEffect(() => {
    const unsubscribe = wsService.subscribeChat((socketMsg: ChatSocketMessage) => {
      if (socketMsg.orderId === orderId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => (m._id || m.id) === socketMsg.messageId)) {
            return prev;
          }
          return [
            ...prev,
            {
              _id: socketMsg.messageId,
              orderId: socketMsg.orderId,
              sender: socketMsg.senderId,
              senderName: socketMsg.senderName,
              senderRole: socketMsg.senderRole as any,
              recipient: socketMsg.recipientId,
              recipientRole: socketMsg.recipientRole,
              message: socketMsg.message,
              createdAt: socketMsg.createdAt,
            },
          ];
        });
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return unsubscribe;
  }, [orderId]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || sending) return;

    setInputText('');
    setSending(true);

    // Optimistic message
    const tempId = 'temp_' + Date.now();
    const optimisticMsg: MessageItem = {
      _id: tempId,
      orderId,
      sender: activeUserId,
      senderName: userProfile?.name || 'Me',
      senderRole: (userProfile?.role as any) || (role as any) || 'customer',
      recipient: recipientId,
      recipientRole,
      message: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const res = await authFetch(`${API_URL}/chat/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          recipientId,
          recipientRole,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...saved, _id: saved._id } : m))
        );
      } else {
        showToast({
          type: 'error',
          title: 'Message Not Sent',
          message: 'Could not deliver message. Please try again.',
        });
      }
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Network Error',
        message: e.message || 'Check your internet connection.',
      });
    } finally {
      setSending(false);
    }
  };

  const getQuickReplies = () => {
    const myRole = userProfile?.role || role || 'customer';
    if (myRole === 'delivery_man') {
      return [
        "I'm on my way!",
        'Arrived at your location',
        'Please come outside to collect',
        'Slight traffic, reaching in 5 mins',
      ];
    }
    if (myRole === 'shopkeeper') {
      return [
        'Preparing your food fresh now!',
        'Order is packed and ready for pickup',
        'Delivery partner assigned',
      ];
    }
    return [
      'Please call me when you arrive',
      'Please leave at the door',
      'Near the main gate',
      'Thank you!',
    ];
  };

  const quickReplies = getQuickReplies();

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'delivery_man':
        return { label: 'Delivery Hero', bg: '#3B82F6' };
      case 'shopkeeper':
        return { label: 'Kitchen Partner', bg: '#F59E0B' };
      case 'admin':
        return { label: 'Support', bg: '#8B5CF6' };
      default:
        return { label: 'Customer', bg: '#10B981' };
    }
  };

  const displayOrderNum = orderNumber || orderId.slice(-6).toUpperCase();
  const recipientBadge = getRoleBadge(recipientRole);

  const renderMessageBubble = ({ item }: { item: MessageItem }) => {
    const senderIdStr =
      typeof item.sender === 'object' && item.sender !== null
        ? item.sender._id || ''
        : item.sender || '';

    const isOutgoing =
      senderIdStr === activeUserId ||
      item.senderRole === (userProfile?.role || role);

    const timeStr = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    const senderBadge = getRoleBadge(item.senderRole);

    return (
      <View style={[styles.bubbleWrapper, isOutgoing ? styles.bubbleRight : styles.bubbleLeft]}>
        {!isOutgoing && (
          <View style={styles.senderHeaderRow}>
            <Text style={styles.senderNameText}>{item.senderName || senderBadge.label}</Text>
            <View style={[styles.miniRoleBadge, { backgroundColor: senderBadge.bg }]}>
              <Text style={styles.miniRoleBadgeText}>{senderBadge.label}</Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.bubbleContainer,
            isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
          ]}
        >
          <Text style={[styles.messageText, isOutgoing ? styles.outgoingText : styles.incomingText]}>
            {item.message}
          </Text>

          <Text
            style={[
              styles.timeText,
              isOutgoing ? styles.outgoingTime : styles.incomingTime,
            ]}
          >
            {timeStr}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B18" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Image source={Icons.back} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.recipientNameText} numberOfLines={1}>
            {recipientName}
          </Text>
          <View style={styles.headerSubRow}>
            <View style={[styles.recipientRoleTag, { backgroundColor: recipientBadge.bg }]}>
              <Text style={styles.recipientRoleTagText}>{recipientBadge.label}</Text>
            </View>
            <Text style={styles.orderNumberSub}>Order #{displayOrderNum}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Chat Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item._id || item.id || index.toString()}
          renderItem={renderMessageBubble}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <ChatBubbleIcon size={34} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Order #{displayOrderNum} Chat</Text>
                <Text style={styles.emptySub}>
                  Direct communication with {recipientName}. Messages are encrypted and linked to this order.
                </Text>
              </View>
            ) : null
          }
        />

        {/* Quick Replies Bar */}
        <View style={styles.quickRepliesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={quickReplies}
            keyExtractor={(item, idx) => idx.toString()}
            contentContainerStyle={styles.quickRepliesList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickReplyChip}
                onPress={() => handleSend(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickReplyText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Message Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim().length > 0 ? colors.primary : '#334155' },
            ]}
            onPress={() => handleSend()}
            disabled={inputText.trim().length === 0 || sending}
            activeOpacity={0.8}
          >
            <SendIcon size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0F172A',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E293B',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#334155',
    },
    backButton: {
      padding: 6,
      marginRight: 10,
    },
    backIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      tintColor: '#FFFFFF',
    },
    headerInfo: {
      flex: 1,
    },
    recipientNameText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    headerSubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    recipientRoleTag: {
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 4,
    },
    recipientRoleTagText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
      textTransform: 'uppercase',
    },
    orderNumberSub: {
      fontSize: 11.5,
      color: '#94A3B8',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },
    bubbleWrapper: {
      marginBottom: 12,
      maxWidth: '82%',
    },
    bubbleRight: {
      alignSelf: 'flex-end',
    },
    bubbleLeft: {
      alignSelf: 'flex-start',
    },
    senderHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 3,
      marginLeft: 4,
    },
    senderNameText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#94A3B8',
    },
    miniRoleBadge: {
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 3,
    },
    miniRoleBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    bubbleContainer: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
    },
    outgoingBubble: {
      backgroundColor: '#FF7622',
      borderBottomRightRadius: 3,
    },
    incomingBubble: {
      backgroundColor: '#1E293B',
      borderBottomLeftRadius: 3,
      borderWidth: 1,
      borderColor: '#334155',
    },
    messageText: {
      fontSize: 14,
      lineHeight: 20,
    },
    outgoingText: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    incomingText: {
      color: '#F8FAFC',
      fontWeight: '400',
    },
    timeText: {
      fontSize: 9.5,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    outgoingTime: {
      color: 'rgba(255, 255, 255, 0.75)',
    },
    incomingTime: {
      color: '#64748B',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 30,
    },
    emptyIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#1E293B',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#334155',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#F8FAFC',
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 12.5,
      color: '#94A3B8',
      textAlign: 'center',
      lineHeight: 18,
    },
    quickRepliesContainer: {
      backgroundColor: '#0B1120',
      borderTopWidth: 1,
      borderTopColor: '#1E293B',
      paddingVertical: 8,
    },
    quickRepliesList: {
      paddingHorizontal: 12,
      gap: 8,
    },
    quickReplyChip: {
      backgroundColor: '#1E293B',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#334155',
    },
    quickReplyText: {
      fontSize: 12,
      color: '#E2E8F0',
      fontWeight: '500',
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E293B',
      paddingHorizontal: 14,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#334155',
      gap: 10,
    },
    textInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      backgroundColor: '#0F172A',
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      fontSize: 14,
      color: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#334155',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
