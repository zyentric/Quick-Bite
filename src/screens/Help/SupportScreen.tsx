import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

type SupportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Support'>;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Hello!', sender: 'user', time: '09:00' },
  { id: '2', text: 'Hello!, please choose the number corresponding to your needs, for a more efficient service.\n\n1. Order Management\n2. Payments Management\n3. Account management and profile\n4. About order tracking\n5. Safety', sender: 'bot', time: '09:00' },
  { id: '3', text: '1', sender: 'user', time: '09:03' },
  { id: '4', text: 'You have a current order\nStrawberry Shake and Broccoli Lasagna\nOrder No. 0054752\n29 Nov., 01:20 pm', sender: 'bot', time: '09:04' },
];

export default function SupportScreen() {
  const navigation = useNavigation<SupportScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);
  
  const [inputText, setInputText] = useState('');
  const [messages, _setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Yellow Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backIcon}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Support</Text>
            <View style={styles.backBtn} />
          </View>
        </View>

        {/* White Content Section */}
        <View style={styles.contentSection}>
          <ScrollView 
            style={styles.chatArea} 
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperBot]}>
                  <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                    <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextBot]}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text style={[styles.timeText, isUser ? styles.timeTextUser : styles.timeTextBot]}>{msg.time}</Text>
                  
                  {/* Render Quick Replies for the last bot message */}
                  {!isUser && msg.id === '4' && (
                    <View style={styles.quickRepliesContainer}>
                      <TouchableOpacity style={[styles.quickReplyBtn, styles.quickReplyBtnActive]}>
                        <Text style={[styles.quickReplyText, styles.quickReplyTextActive]}>Order issues</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.quickReplyBtn, styles.quickReplyBtnOutline]}>
                        <Text style={[styles.quickReplyText, styles.quickReplyTextOutline]}>Order not received</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconText}>📎</Text>
            </TouchableOpacity>
            
            <View style={styles.textInputContainer}>
              <TextInput 
                style={styles.textInput}
                placeholder="Write Here..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
              />
            </View>

            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconText}>🎤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendBtn}>
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7D055', 
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary, 
  },
  headerSection: {
    backgroundColor: '#F7D055',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30, 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    overflow: 'hidden',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    marginBottom: 20,
    maxWidth: '85%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageWrapperBot: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    padding: 15,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: '#F5F5EC', // Light beige
    borderBottomRightRadius: 5,
  },
  bubbleBot: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#666',
  },
  messageTextBot: {
    color: colors.primary,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  timeTextUser: {
    textAlign: 'right',
  },
  timeTextBot: {
    textAlign: 'left',
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 10,
  },
  quickReplyBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickReplyBtnActive: {
    backgroundColor: colors.primary,
  },
  quickReplyBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickReplyTextActive: {
    color: '#fff',
  },
  quickReplyTextOutline: {
    color: colors.primary,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FDF7E8', // Very light orange/beige
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    color: '#F7D055',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    height: 40,
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  sendBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: colors.primary,
  }
});
