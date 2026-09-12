import React from 'react';
import { View } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

/** 👨‍🍳 Chef Hat Vector Icon */
export function ChefHatIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Top puffs */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 1 }}>
        <View
          style={{
            width: size * 0.28,
            height: size * 0.35,
            borderRadius: (size * 0.28) / 2,
            backgroundColor: color,
          }}
        />
        <View
          style={{
            width: size * 0.36,
            height: size * 0.44,
            borderRadius: (size * 0.36) / 2,
            backgroundColor: color,
            marginBottom: size * 0.05,
          }}
        />
        <View
          style={{
            width: size * 0.28,
            height: size * 0.35,
            borderRadius: (size * 0.28) / 2,
            backgroundColor: color,
          }}
        />
      </View>
      {/* Base band */}
      <View
        style={{
          width: size * 0.68,
          height: size * 0.22,
          backgroundColor: color,
          borderRadius: 2,
          marginTop: -size * 0.06,
        }}
      />
    </View>
  );
}

/** 🍳 Kitchen Pan / Cooking Vector Icon */
export function CookingPanIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.65,
          height: size * 0.4,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          borderBottomLeftRadius: size * 0.2,
          borderBottomRightRadius: size * 0.2,
        }}
      />
      {/* Handle */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.05,
          top: size * 0.35,
          width: size * 0.35,
          height: Math.max(2, size * 0.09),
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '25deg' }],
        }}
      />
    </View>
  );
}

/** 🏪 Store / Kitchen Front Vector Icon */
export function StoreFrontIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Roof Awning */}
      <View
        style={{
          width: size * 0.78,
          height: size * 0.28,
          borderTopLeftRadius: size * 0.08,
          borderTopRightRadius: size * 0.08,
          backgroundColor: color,
        }}
      />
      {/* Store Body */}
      <View
        style={{
          width: size * 0.68,
          height: size * 0.42,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          borderTopWidth: 0,
          borderBottomLeftRadius: size * 0.08,
          borderBottomRightRadius: size * 0.08,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.25,
            height: size * 0.28,
            borderWidth: 1.5,
            borderColor: color,
            borderBottomWidth: 0,
          }}
        />
      </View>
    </View>
  );
}

/** 🔔 Notification Bell / Incoming Order Icon */
export function OrderBellIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.65,
          height: size * 0.55,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          borderTopLeftRadius: size * 0.3,
          borderTopRightRadius: size * 0.3,
          borderBottomWidth: 0,
        }}
      />
      <View
        style={{
          width: size * 0.8,
          height: Math.max(2, size * 0.09),
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          width: size * 0.2,
          height: size * 0.12,
          borderBottomLeftRadius: size * 0.1,
          borderBottomRightRadius: size * 0.1,
          backgroundColor: color,
          marginTop: 1,
        }}
      />
    </View>
  );
}

/** 💰 Revenue / Cash Dollar Icon */
export function RevenueStatsIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: (size * 0.8) / 2,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.08,
            height: size * 0.5,
            backgroundColor: color,
            position: 'absolute',
          }}
        />
        <View
          style={{
            width: size * 0.35,
            height: size * 0.35,
            borderWidth: 1.5,
            borderColor: color,
            borderRadius: size * 0.06,
          }}
        />
      </View>
    </View>
  );
}
