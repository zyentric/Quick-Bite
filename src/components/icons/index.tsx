import React from 'react';
import { View } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export function StarIcon({ size = 16, color = '#F59E0B' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
          borderRadius: 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: color,
          transform: [{ rotate: '0deg' }],
          borderRadius: 2,
        }}
      />
    </View>
  );
}

export function HeartIcon({ size = 18, color = '#EF4444' }: IconProps & { filled?: boolean }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.75,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.25,
          borderTopRightRadius: size * 0.25,
          transform: [{ rotate: '-45deg' }, { translateX: -size * 0.12 }],
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size * 0.5,
          height: size * 0.75,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.25,
          borderTopRightRadius: size * 0.25,
          transform: [{ rotate: '45deg' }, { translateX: size * 0.12 }],
          position: 'absolute',
        }}
      />
    </View>
  );
}

export function LockIcon({ size = 24, color = '#6B7280' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.45,
          borderWidth: Math.max(2, size * 0.1),
          borderColor: color,
          borderTopLeftRadius: size * 0.25,
          borderTopRightRadius: size * 0.25,
          borderBottomWidth: 0,
          marginBottom: -size * 0.05,
        }}
      />
      <View
        style={{
          width: size * 0.75,
          height: size * 0.55,
          backgroundColor: color,
          borderRadius: size * 0.12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.15,
            height: size * 0.2,
            backgroundColor: '#FFFFFF',
            borderRadius: size * 0.075,
          }}
        />
      </View>
    </View>
  );
}

export function ClockIcon({ size = 16, color = '#6B7280' }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: Math.max(1.5, size * 0.1),
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: Math.max(1.5, size * 0.1),
          height: size * 0.35,
          backgroundColor: color,
          position: 'absolute',
          top: size * 0.15,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          width: size * 0.25,
          height: Math.max(1.5, size * 0.1),
          backgroundColor: color,
          position: 'absolute',
          left: size * 0.4,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

export function LocationPinIcon({ size = 18, color = '#EF4444' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: (size * 0.75) / 2,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            backgroundColor: '#FFFFFF',
          }}
        />
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.2,
          borderRightWidth: size * 0.2,
          borderTopWidth: size * 0.3,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
          marginTop: -size * 0.05,
        }}
      />
    </View>
  );
}

export function FastDeliveryIcon({ size = 22, color = '#F59E0B' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderRightWidth: size * 0.35,
          borderBottomWidth: size * 0.45,
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.35,
          borderTopWidth: size * 0.45,
          borderLeftColor: 'transparent',
          borderTopColor: color,
          marginTop: -size * 0.1,
        }}
      />
    </View>
  );
}

export function ShieldCheckIcon({ size = 22, color = '#10B981' }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderTopLeftRadius: size * 0.4,
        borderTopRightRadius: size * 0.4,
        borderBottomLeftRadius: size * 0.5,
        borderBottomRightRadius: size * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.4,
          height: size * 0.25,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderColor: '#FFFFFF',
          transform: [{ rotate: '-45deg' }],
          marginTop: -size * 0.05,
        }}
      />
    </View>
  );
}

export function CreditCardIcon({ size = 22, color = '#3B82F6' }: IconProps) {
  return (
    <View
      style={{
        width: size * 1.2,
        height: size * 0.8,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: color,
        justifyContent: 'space-between',
        paddingVertical: 2,
      }}
    >
      <View style={{ height: 3, backgroundColor: color, width: '100%' }} />
      <View style={{ width: 6, height: 4, backgroundColor: color, marginLeft: 3, borderRadius: 1 }} />
    </View>
  );
}

export function CameraIcon({ size = 20, color = '#6B7280' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.3,
          height: size * 0.15,
          backgroundColor: color,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      />
      <View
        style={{
          width: size * 0.9,
          height: size * 0.65,
          backgroundColor: color,
          borderRadius: 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: (size * 0.35) / 2,
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        />
      </View>
    </View>
  );
}

export function HomeBuildingIcon({ size = 18, color = '#F59E0B' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.45,
          borderRightWidth: size * 0.45,
          borderBottomWidth: size * 0.4,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View
        style={{
          width: size * 0.7,
          height: size * 0.5,
          backgroundColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.25,
            height: size * 0.3,
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
      </View>
    </View>
  );
}

export function WorkBuildingIcon({ size = 18, color = '#6366F1' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.4,
          height: size * 0.2,
          borderWidth: 1.5,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }}
      />
      <View
        style={{
          width: size * 0.85,
          height: size * 0.6,
          backgroundColor: color,
          borderRadius: 3,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', height: 1.5, backgroundColor: '#FFFFFF', opacity: 0.7 }} />
      </View>
    </View>
  );
}

export function DocumentIcon({ size = 24, color = '#9CA3AF' }: IconProps) {
  return (
    <View
      style={{
        width: size * 0.75,
        height: size,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 3,
        padding: 2,
        justifyContent: 'space-around',
      }}
    >
      <View style={{ height: 2, backgroundColor: color, width: '80%' }} />
      <View style={{ height: 2, backgroundColor: color, width: '60%' }} />
      <View style={{ height: 2, backgroundColor: color, width: '70%' }} />
    </View>
  );
}

export function CheckCircleIcon({ size = 20, color = '#10B981' }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.4,
          height: size * 0.25,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderColor: '#FFFFFF',
          transform: [{ rotate: '-45deg' }],
          marginTop: -size * 0.05,
        }}
      />
    </View>
  );
}

export function CancelCircleIcon({ size = 20, color = '#EF4444' }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.5,
          height: 2,
          backgroundColor: '#FFFFFF',
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size * 0.5,
          height: 2,
          backgroundColor: '#FFFFFF',
          transform: [{ rotate: '-45deg' }],
          position: 'absolute',
        }}
      />
    </View>
  );
}

export function BurgerIcon({ size = 24, color = '#F59E0B' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'space-between', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.9,
          height: size * 0.35,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.35,
          borderTopRightRadius: size * 0.35,
        }}
      />
      <View
        style={{
          width: size * 0.95,
          height: size * 0.15,
          backgroundColor: '#10B981',
          borderRadius: 2,
        }}
      />
      <View
        style={{
          width: size * 0.95,
          height: size * 0.18,
          backgroundColor: '#8B4513',
          borderRadius: 2,
        }}
      />
      <View
        style={{
          width: size * 0.9,
          height: size * 0.2,
          backgroundColor: color,
          borderBottomLeftRadius: size * 0.1,
          borderBottomRightRadius: size * 0.1,
        }}
      />
    </View>
  );
}

export function FireIcon({ size = 18, color = '#EF4444' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: size * 0.7,
          height: size * 0.85,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.35,
          borderTopRightRadius: size * 0.1,
          borderBottomLeftRadius: size * 0.35,
          borderBottomRightRadius: size * 0.35,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 2,
          width: size * 0.35,
          height: size * 0.45,
          backgroundColor: '#F59E0B',
          borderTopLeftRadius: size * 0.15,
          borderTopRightRadius: size * 0.05,
          borderBottomLeftRadius: size * 0.15,
          borderBottomRightRadius: size * 0.15,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function LeafIcon({ size = 18, color = '#10B981' }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.75,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.75,
          borderBottomRightRadius: size * 0.75,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.6,
          height: 1.5,
          backgroundColor: '#FFFFFF',
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

export function TagIcon({ size = 18, color = '#3B82F6' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.6,
          height: size * 0.8,
          backgroundColor: color,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          transform: [{ rotate: '45deg' }],
          alignItems: 'center',
          paddingTop: 3,
        }}
      >
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF' }} />
      </View>
    </View>
  );
}

export function PercentIcon({ size = 16, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 2, left: 2, width: 4, height: 4, borderRadius: 2, borderWidth: 1, borderColor: color }} />
      <View style={{ width: size * 0.8, height: 1.5, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
      <View style={{ position: 'absolute', bottom: 2, right: 2, width: 4, height: 4, borderRadius: 2, borderWidth: 1, borderColor: color }} />
    </View>
  );
}

export function SparkleIcon({ size = 16, color = '#F59E0B' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: size * 0.8, height: 2, backgroundColor: color, position: 'absolute' }} />
      <View style={{ width: 2, height: size * 0.8, backgroundColor: color, position: 'absolute' }} />
      <View style={{ width: size * 0.5, height: 2, backgroundColor: color, position: 'absolute', transform: [{ rotate: '45deg' }] }} />
      <View style={{ width: 2, height: size * 0.5, backgroundColor: color, position: 'absolute', transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

/** ✏️ Clean Edit/Pencil Vector Icon */
export function EditIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Pencil barrel */}
      <View
        style={{
          width: size * 0.32,
          height: size * 0.62,
          borderWidth: 1.6,
          borderColor: color,
          borderRadius: 2,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {/* Bottom line representing the written surface */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.1,
          left: size * 0.15,
          right: size * 0.15,
          height: 1.8,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

/** 🗑️ Clean Trash/Delete Can Vector Icon */
export function TrashIcon({ size = 18, color = '#EF4444' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Lid handle */}
      <View
        style={{
          width: size * 0.28,
          height: 2,
          backgroundColor: color,
          borderTopLeftRadius: 1,
          borderTopRightRadius: 1,
          marginBottom: 1,
        }}
      />
      {/* Lid top rim */}
      <View
        style={{
          width: size * 0.72,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
          marginBottom: 2,
        }}
      />
      {/* Bin Body */}
      <View
        style={{
          width: size * 0.54,
          height: size * 0.54,
          borderWidth: 1.6,
          borderColor: color,
          borderTopWidth: 0,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          paddingVertical: 2,
        }}
      >
        <View style={{ width: 1.2, height: '70%', backgroundColor: color }} />
        <View style={{ width: 1.2, height: '70%', backgroundColor: color }} />
      </View>
    </View>
  );
}

/** ℹ️ Clean Info Circle Vector Icon */
export function InfoCircleIcon({ size = 20, color = '#3B82F6' }: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 2.2,
          height: 2.2,
          borderRadius: 1.1,
          backgroundColor: color,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 2.2,
          height: size * 0.35,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

/** 🔔 Notification Bell Icon */
export function BellRingIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderTopLeftRadius: size * 0.28,
          borderTopRightRadius: size * 0.28,
          borderWidth: 1.8,
          borderColor: color,
          borderBottomWidth: 0,
        }}
      />
      <View
        style={{
          width: size * 0.75,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          width: size * 0.2,
          height: 2.5,
          backgroundColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          marginTop: 1,
        }}
      />
    </View>
  );
}

/** 💬 Clean Chat Bubble Vector Icon */
export function ChatBubbleIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Main oval bubble */}
      <View
        style={{
          width: size * 0.82,
          height: size * 0.62,
          borderRadius: size * 0.24,
          borderWidth: 1.8,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 2.5 }}>
          <View style={{ width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: color }} />
          <View style={{ width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: color }} />
          <View style={{ width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: color }} />
        </View>
      </View>
      {/* Little tail on bottom-left */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.12,
          left: size * 0.2,
          width: size * 0.22,
          height: size * 0.18,
          backgroundColor: color,
          borderBottomLeftRadius: size * 0.15,
          transform: [{ rotate: '-35deg' }],
        }}
      />
    </View>
  );
}

/** ✈️ Clean Send / Paper Airplane Vector Icon */
export function SendIcon({ size = 18, color = '#FFFFFF' }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderRightWidth: 2.2,
          borderTopWidth: 2.2,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateY: size * 0.05 }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 2.2,
          height: size * 0.65,
          backgroundColor: color,
          transform: [{ translateY: size * 0.05 }],
        }}
      />
    </View>
  );
}
export * from './DeliveryIcons';
