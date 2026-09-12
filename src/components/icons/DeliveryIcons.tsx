import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

/** 🛵 Clean Delivery Scooter / Bike Vector Icon */
export function DeliveryBikeIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Front Wheel */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.1,
          bottom: size * 0.1,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: (size * 0.32) / 2,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
        }}
      />
      {/* Rear Wheel */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.1,
          bottom: size * 0.1,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: (size * 0.32) / 2,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
        }}
      />
      {/* Chassis bar */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.22,
          left: size * 0.2,
          right: size * 0.2,
          height: Math.max(2, size * 0.08),
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Handlebar stem */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.24,
          top: size * 0.2,
          width: Math.max(2, size * 0.08),
          height: size * 0.45,
          backgroundColor: color,
          transform: [{ rotate: '-20deg' }],
          borderRadius: 1,
        }}
      />
      {/* Handlebar */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.16,
          top: size * 0.18,
          width: size * 0.22,
          height: Math.max(2, size * 0.08),
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Delivery Box on Back */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.16,
          top: size * 0.22,
          width: size * 0.28,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />
    </View>
  );
}

/** 📦 Clean Delivery Box / Parcel Vector Icon */
export function PackageIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.7,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          borderRadius: size * 0.1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: Math.max(1.5, size * 0.07),
            backgroundColor: color,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: Math.max(1.5, size * 0.07),
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

/** 📍 Clean Location Marker Pin Icon */
export function LocationPinIcon({ size = 20, color = '#EF4444' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Pin Head */}
      <View
        style={{
          width: size * 0.65,
          height: size * 0.65,
          borderRadius: (size * 0.65) / 2,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: -size * 0.18,
        }}
      >
        {/* Inner Hole */}
        <View
          style={{
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: (size * 0.25) / 2,
            backgroundColor: '#FFFFFF',
          }}
        />
      </View>
      {/* Pin Point */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.18,
          borderRightWidth: size * 0.18,
          borderTopWidth: size * 0.28,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
          marginTop: -size * 0.06,
        }}
      />
    </View>
  );
}

/** 🍽️ Clean Restaurant / Fork-Spoon Vector Icon */
export function RestaurantIcon({ size = 20, color = '#F59E0B' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Plate Ring */}
      <View
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: (size * 0.8) / 2,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: size * 0.12,
        }}
      >
        {/* Fork */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 1 }}>
            <View style={{ width: 1.5, height: size * 0.18, backgroundColor: color }} />
            <View style={{ width: 1.5, height: size * 0.18, backgroundColor: color }} />
            <View style={{ width: 1.5, height: size * 0.18, backgroundColor: color }} />
          </View>
          <View style={{ width: 1.5, height: size * 0.22, backgroundColor: color }} />
        </View>

        {/* Spoon */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: size * 0.18,
              height: size * 0.22,
              borderRadius: (size * 0.18) / 2,
              backgroundColor: color,
            }}
          />
          <View style={{ width: 1.5, height: size * 0.18, backgroundColor: color }} />
        </View>
      </View>
    </View>
  );
}

/** 📞 Clean Phone Handset Vector Icon */
export function PhoneCallIcon({ size = 18, color = '#10B981' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.65,
          height: size * 0.65,
          borderRadius: size * 0.16,
          borderWidth: Math.max(1.8, size * 0.1),
          borderColor: color,
          borderBottomRightRadius: 0,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/** 🗺️ Clean Navigation / Compass Arrow Vector Icon */
export function MapNavigationIcon({ size = 18, color = '#3B82F6' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.28,
          borderRightWidth: size * 0.28,
          borderBottomWidth: size * 0.65,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          transform: [{ rotate: '45deg' }, { translateY: -size * 0.05 }],
        }}
      />
    </View>
  );
}

/** 💵 Clean Cash / Banknote Icon (COD) */
export function CashMoneyIcon({ size = 18, color = '#E11D48' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.52,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          borderRadius: size * 0.08,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: (size * 0.22) / 2,
            borderWidth: 1.5,
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
}

/** 💳 Clean Card / Prepaid Icon */
export function CardPaymentIcon({ size = 18, color = '#15803D' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.85,
          height: size * 0.55,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          borderRadius: size * 0.08,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: size * 0.14,
            backgroundColor: color,
            marginTop: size * 0.08,
          }}
        />
      </View>
    </View>
  );
}

/** ✅ Clean Checkmark Circle Icon */
export function CheckCircleIcon({ size = 20, color = '#10B981' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: (size * 0.8) / 2,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.35,
            height: size * 0.2,
            borderColor: '#FFFFFF',
            borderBottomWidth: 2,
            borderLeftWidth: 2,
            transform: [{ rotate: '-45deg' }, { translateY: -1 }],
          }}
        />
      </View>
    </View>
  );
}

/** ⚠️ Clean Warning Alert Triangle Icon */
export function WarningTriangleIcon({ size = 20, color = '#E11D48' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.4,
          borderRightWidth: size * 0.4,
          borderBottomWidth: size * 0.7,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.22,
          width: 2,
          height: size * 0.25,
          backgroundColor: '#FFFFFF',
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.12,
          width: 2,
          height: 2,
          backgroundColor: '#FFFFFF',
          borderRadius: 1,
        }}
      />
    </View>
  );
}

/** 📄 Clean ID / License Document Icon */
export function DocumentIdIcon({ size = 20, color = '#6B7280' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.65,
          height: size * 0.8,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          borderRadius: size * 0.08,
          padding: size * 0.08,
          justifyContent: 'space-around',
        }}
      >
        <View style={{ width: '100%', height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: '70%', height: 2, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: '90%', height: 2, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  );
}

/** 🕒 Clean Clock History Icon */
export function ClockHistoryIcon({ size = 20, color = '#6B7280' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.78,
          height: size * 0.78,
          borderRadius: (size * 0.78) / 2,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: size * 0.16,
            width: Math.max(1.8, size * 0.09),
            height: size * 0.26,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: size * 0.35,
            top: size * 0.35,
            width: size * 0.22,
            height: Math.max(1.8, size * 0.09),
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
      </View>
    </View>
  );
}

/** 🛡️ Clean Partner Shield Verification Badge Icon */
export function ShieldCheckIcon({ size = 20, color = '#10B981' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.8,
          borderWidth: Math.max(1.8, size * 0.09),
          borderColor: color,
          borderTopLeftRadius: size * 0.1,
          borderTopRightRadius: size * 0.1,
          borderBottomLeftRadius: size * 0.35,
          borderBottomRightRadius: size * 0.35,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.32,
            height: size * 0.18,
            borderColor: color,
            borderBottomWidth: 2,
            borderLeftWidth: 2,
            transform: [{ rotate: '-45deg' }, { translateY: -1 }],
          }}
        />
      </View>
    </View>
  );
}

/** ⚡ Clean Fast Speed Lightning Bolt Icon */
export function LightningIcon({ size = 18, color = '#F59E0B' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.2,
          borderRightWidth: size * 0.2,
          borderBottomWidth: size * 0.45,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          transform: [{ rotate: '15deg' }, { translateY: -size * 0.1 }],
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.2,
          borderRightWidth: size * 0.2,
          borderTopWidth: size * 0.45,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
          transform: [{ rotate: '15deg' }, { translateY: size * 0.1 }],
        }}
      />
    </View>
  );
}
