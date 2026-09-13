import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  PanResponder,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircleIcon,
  InfoCircleIcon,
  BellRingIcon,
} from './icons';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'order';

export interface ToastConfig {
  id: string;
  type?: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface CustomToastProps {
  toast: ToastConfig | null;
  onDismiss: () => void;
}

export default function CustomToast({ toast, onDismiss }: CustomToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toast) {
      // Clear previous timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Slide down and fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const duration = toast.duration || 4000;
      timerRef.current = setTimeout(() => {
        dismiss();
      }, duration);
    } else {
      translateY.setValue(-120);
      opacity.setValue(0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast]);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!toast) return null;

  const getAccentColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10B981';
      case 'order':
        return '#FF7622';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'info':
      default:
        return '#3B82F6';
    }
  };

  const renderIcon = () => {
    const color = getAccentColor();
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon size={22} color={color} />;
      case 'order':
        return <BellRingIcon size={22} color="#FFFFFF" />;
      case 'error':
      case 'warning':
      case 'info':
      default:
        return <InfoCircleIcon size={22} color={color} />;
    }
  };

  const accentColor = getAccentColor();

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          top: Math.max(insets.top, 16) + 4,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismiss}
        style={[styles.toastContainer, { borderLeftColor: accentColor }]}
      >
        <View style={[styles.iconBadge, { backgroundColor: toast.type === 'order' ? accentColor : '#1E293B' }]}>
          {renderIcon()}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {toast.title}
          </Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {toast.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 99999,
    alignItems: 'center',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  messageText: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
