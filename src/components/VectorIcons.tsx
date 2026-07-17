import React from 'react';
import { View, StyleSheet } from 'react-native';

export function EyeIcon({ color = '#666', size = 20 }) {
  const width = size;
  const height = size * 0.65;
  const pupilSize = size * 0.35;

  return (
    <View style={[styles.eyeContainer, { width, height, borderColor: color, borderRadius: size * 0.5 }]}>
      <View style={[styles.pupil, { width: pupilSize, height: pupilSize, borderRadius: pupilSize * 0.5, backgroundColor: color }]} />
    </View>
  );
}

export function EyeOffIcon({ color = '#666', size = 20 }) {
  const width = size;
  const height = size * 0.65;
  const pupilSize = size * 0.35;

  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <View style={[styles.eyeContainer, { width, height, borderColor: color, borderRadius: size * 0.5, opacity: 0.6 }]}>
        <View style={[styles.pupil, { width: pupilSize, height: pupilSize, borderRadius: pupilSize * 0.5, backgroundColor: color }]} />
      </View>
      <View style={[styles.diagonalLine, { width: size * 1.2, backgroundColor: color }]} />
    </View>
  );
}

export function FingerprintIcon({ color = '#F2B824', size = 80 }) {
  return (
    <View style={[styles.fingerprintContainer, { width: size, height: size * 1.2 }]}>
      {/* Outer loop */}
      <View style={[styles.fingerprintLoop, { width: size, height: size, borderRadius: size / 2, borderColor: color, borderBottomWidth: 0 }]} />
      {/* Mid loop */}
      <View style={[styles.fingerprintLoop, { width: size * 0.75, height: size * 0.75, borderRadius: (size * 0.75) / 2, borderColor: color, borderBottomWidth: 0, position: 'absolute', top: size * 0.125 }]} />
      {/* Inner loop */}
      <View style={[styles.fingerprintLoop, { width: size * 0.5, height: size * 0.5, borderRadius: (size * 0.5) / 2, borderColor: color, borderBottomWidth: 0, position: 'absolute', top: size * 0.25 }]} />
      {/* Center line */}
      <View style={[styles.fingerprintCenter, { height: size * 0.4, width: 4, backgroundColor: color, position: 'absolute', bottom: size * 0.15, borderRadius: 2 }]} />
    </View>
  );
}

export function GoogleIcon({ size = 20 }) {
  return (
    <View style={[styles.socialLogoContainer, { width: size, height: size, borderColor: '#EA4335' }]}>
      <View style={[styles.googleSegment, { borderColor: '#4285F4', borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: size / 2, width: size, height: size }]} />
      <View style={[styles.googleSegment, { borderColor: '#34A853', borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: size / 2, width: size, height: size, position: 'absolute' }]} />
      <View style={[styles.googleSegment, { borderColor: '#FBBC05', borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: size / 2, width: size, height: size, position: 'absolute' }]} />
    </View>
  );
}

export function FacebookIcon({ size = 20 }) {
  return (
    <View style={[styles.facebookContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.facebookFHorizontal, { width: size * 0.4, height: size * 0.15, top: size * 0.35, left: size * 0.25 }]} />
      <View style={[styles.facebookFVertical, { width: size * 0.15, height: size * 0.7, top: size * 0.15, left: size * 0.5 }]} />
      <View style={[styles.facebookFVertical, { width: size * 0.35, height: size * 0.15, borderTopWidth: size * 0.15, borderTopRightRadius: size * 0.2, top: size * 0.15, left: size * 0.3, borderRightWidth: size * 0.15, borderColor: '#fff' }]} />
    </View>
  );
}

export function AppleIcon({ size = 20, color = '#000' }) {
  return (
    <View style={[styles.appleContainer, { width: size, height: size }]}>
      {/* Left side */}
      <View style={[styles.appleBodyHalf, { width: size * 0.45, height: size * 0.7, borderTopLeftRadius: size * 0.3, borderBottomLeftRadius: size * 0.35, borderBottomRightRadius: size * 0.2, backgroundColor: color }]} />
      {/* Right side */}
      <View style={[styles.appleBodyHalf, { width: size * 0.45, height: size * 0.7, borderTopRightRadius: size * 0.3, borderBottomRightRadius: size * 0.35, borderBottomLeftRadius: size * 0.2, backgroundColor: color, marginLeft: size * 0.05 }]} />
      {/* Leaf */}
      <View style={[styles.appleLeaf, { width: size * 0.25, height: size * 0.25, borderTopRightRadius: size * 0.25, borderBottomLeftRadius: size * 0.25, backgroundColor: color, position: 'absolute', top: -size * 0.05, right: size * 0.2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  eyeContainer: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {},
  diagonalLine: {
    height: 2,
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
  fingerprintContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerprintLoop: {
    borderWidth: 3.5,
    borderStyle: 'solid',
  },
  fingerprintCenter: {},
  socialLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleSegment: {
    borderWidth: 0,
  },
  facebookContainer: {
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  facebookFVertical: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  facebookFHorizontal: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  appleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleBodyHalf: {},
  appleLeaf: {
    transform: [{ rotate: '45deg' }],
  },
});

export function SearchIcon({ color = '#666', size = 20 }) {
  const circleSize = size * 0.55;
  const handleLength = size * 0.45;
  const strokeWidth = Math.max(1.5, size * 0.08);
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: circleSize,
        height: circleSize,
        borderRadius: circleSize / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        position: 'absolute',
        top: size * 0.05,
        left: size * 0.05,
      }} />
      <View style={{
        width: strokeWidth,
        height: handleLength,
        backgroundColor: color,
        position: 'absolute',
        bottom: size * 0.05,
        right: size * 0.1,
        transform: [{ rotate: '-45deg' }],
        borderRadius: strokeWidth / 2,
      }} />
    </View>
  );
}

export function GearIcon({ color = '#666', size = 20 }) {
  const outerSize = size * 0.7;
  const strokeWidth = Math.max(2, size * 0.12);
  const toothWidth = size * 0.18;
  const toothHeight = size * 0.18;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {[0, 45, 90, 135].map((angle, index) => (
        <View
          key={index}
          style={{
            width: toothWidth,
            height: size,
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'space-between',
            transform: [{ rotate: `${angle}deg` }],
          }}
        >
          <View style={{ width: toothWidth, height: toothHeight, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: toothWidth, height: toothHeight, backgroundColor: color, borderRadius: 1 }} />
        </View>
      ))}
      <View style={{
        width: outerSize,
        height: outerSize,
        borderRadius: outerSize / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        position: 'absolute',
      }} />
    </View>
  );
}

export function CartIcon({ color = '#666', size = 20 }) {
  const basketWidth = size * 0.6;
  const basketHeight = size * 0.45;
  const wheelSize = size * 0.15;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: size * 0.18,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.1,
        top: size * 0.3,
        transform: [{ rotate: '-20deg' }],
      }} />
      <View style={{
        width: basketWidth,
        height: basketHeight,
        borderWidth: 1.8,
        borderColor: color,
        borderTopWidth: 0,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        position: 'absolute',
        top: size * 0.28,
        left: size * 0.22,
      }}>
        <View style={{ width: '100%', height: 1, backgroundColor: color, position: 'absolute', top: basketHeight * 0.4 }} />
        <View style={{ width: 1, height: '100%', backgroundColor: color, position: 'absolute', left: basketWidth * 0.4 }} />
      </View>
      <View style={{
        width: wheelSize,
        height: wheelSize,
        borderRadius: wheelSize / 2,
        backgroundColor: color,
        position: 'absolute',
        bottom: size * 0.12,
        left: size * 0.3,
      }} />
      <View style={{
        width: wheelSize,
        height: wheelSize,
        borderRadius: wheelSize / 2,
        backgroundColor: color,
        position: 'absolute',
        bottom: size * 0.12,
        right: size * 0.22,
      }} />
    </View>
  );
}

export function BellIcon({ color = '#666', size = 20 }) {
  const bellWidth = size * 0.55;
  const bellHeight = size * 0.55;
  const clapperSize = size * 0.16;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: bellWidth,
        height: bellHeight,
        borderWidth: 1.8,
        borderColor: color,
        borderTopLeftRadius: bellWidth / 2,
        borderTopRightRadius: bellWidth / 2,
        borderBottomWidth: 0,
        position: 'absolute',
        top: size * 0.18,
      }} />
      <View style={{
        width: bellWidth * 1.25,
        height: 1.8,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.18 + bellHeight,
        borderRadius: 1,
      }} />
      <View style={{
        width: clapperSize,
        height: clapperSize,
        borderRadius: clapperSize / 2,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.18 + bellHeight + 1.8,
      }} />
    </View>
  );
}

export function UserIcon({ color = '#666', size = 20 }) {
  const headSize = size * 0.35;
  const bodyWidth = size * 0.65;
  const bodyHeight = size * 0.35;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: headSize,
        height: headSize,
        borderRadius: headSize / 2,
        borderWidth: 1.8,
        borderColor: color,
        position: 'absolute',
        top: size * 0.15,
      }} />
      <View style={{
        width: bodyWidth,
        height: bodyHeight,
        borderWidth: 1.8,
        borderColor: color,
        borderTopLeftRadius: bodyWidth * 0.4,
        borderTopRightRadius: bodyWidth * 0.4,
        borderBottomWidth: 0,
        position: 'absolute',
        bottom: size * 0.12,
      }} />
    </View>
  );
}

export function HomeIcon({ color = '#666', size = 24 }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderLeftWidth: size * 0.45,
        borderRightWidth: size * 0.45,
        borderBottomWidth: size * 0.38,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        position: 'absolute',
        top: size * 0.08,
      }} />
      <View style={{
        width: size * 0.7,
        height: size * 0.45,
        borderWidth: 1.8,
        borderColor: color,
        borderTopWidth: 0,
        position: 'absolute',
        bottom: size * 0.1,
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}>
        <View style={{
          width: size * 0.22,
          height: size * 0.25,
          borderWidth: 1.8,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }} />
      </View>
    </View>
  );
}

export function MenuIcon({ color = '#666', size = 24 }) {
  const plateSize = size * 0.45;
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: size * 0.15, height: size * 0.65, justifyContent: 'space-between', alignItems: 'center', marginRight: size * 0.08 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <View style={{ width: 1.5, height: size * 0.25, backgroundColor: color }} />
          <View style={{ width: 1.5, height: size * 0.25, backgroundColor: color }} />
          <View style={{ width: 1.5, height: size * 0.25, backgroundColor: color }} />
        </View>
        <View style={{ width: 1.8, height: size * 0.4, backgroundColor: color }} />
      </View>
      <View style={{
        width: plateSize,
        height: plateSize,
        borderRadius: plateSize / 2,
        borderWidth: 1.8,
        borderColor: color,
      }} />
      <View style={{ width: size * 0.15, height: size * 0.65, alignItems: 'center', marginLeft: size * 0.08 }}>
        <View style={{
          width: size * 0.08,
          height: size * 0.35,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.1,
          borderTopRightRadius: 2,
        }} />
        <View style={{ width: 1.8, height: size * 0.3, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function HeartIcon({ color = '#666', size = 24 }) {
  const boxSize = size * 0.45;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', paddingTop: size * 0.08 }}>
      <View style={{
        width: boxSize,
        height: boxSize,
        transform: [{ rotate: '45deg' }],
      }}>
        <View style={{
          position: 'absolute',
          width: boxSize,
          height: boxSize,
          borderLeftWidth: 1.8,
          borderBottomWidth: 1.8,
          borderColor: color,
        }} />
        <View style={{
          position: 'absolute',
          width: boxSize,
          height: boxSize,
          borderRadius: boxSize / 2,
          borderWidth: 1.8,
          borderColor: 'transparent',
          borderTopColor: color,
          borderLeftColor: color,
          top: -boxSize / 2,
          left: 0,
        }} />
        <View style={{
          position: 'absolute',
          width: boxSize,
          height: boxSize,
          borderRadius: boxSize / 2,
          borderWidth: 1.8,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: color,
          left: boxSize / 2,
          top: 0,
        }} />
      </View>
    </View>
  );
}

export function ClipboardIcon({ color = '#666', size = 24 }) {
  const boardWidth = size * 0.55;
  const boardHeight = size * 0.7;
  const clipWidth = size * 0.24;
  const clipHeight = size * 0.12;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: boardWidth,
        height: boardHeight,
        borderWidth: 1.8,
        borderColor: color,
        borderRadius: 4,
        position: 'absolute',
        top: size * 0.18,
        paddingTop: size * 0.18,
        alignItems: 'center',
      }}>
        <View style={{ width: boardWidth * 0.6, height: 1.5, backgroundColor: color, marginBottom: 4 }} />
        <View style={{ width: boardWidth * 0.6, height: 1.5, backgroundColor: color, marginBottom: 4 }} />
        <View style={{ width: boardWidth * 0.4, height: 1.5, backgroundColor: color }} />
      </View>
      <View style={{
        width: clipWidth,
        height: clipHeight,
        borderWidth: 1.8,
        borderColor: color,
        borderBottomWidth: 0,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        position: 'absolute',
        top: size * 0.12,
      }} />
    </View>
  );
}

export function HelpIcon({ color = '#666', size = 24 }) {
  const headBandRadius = size * 0.32;
  const cupSize = size * 0.16;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: headBandRadius * 2,
        height: headBandRadius * 2,
        borderRadius: headBandRadius,
        borderWidth: 1.8,
        borderColor: color,
        borderBottomColor: 'transparent',
        position: 'absolute',
        top: size * 0.12,
      }} />
      <View style={{
        width: cupSize,
        height: cupSize * 1.3,
        borderRadius: 3,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.12,
        top: size * 0.12 + headBandRadius - 2,
      }} />
      <View style={{
        width: cupSize,
        height: cupSize * 1.3,
        borderRadius: 3,
        backgroundColor: color,
        position: 'absolute',
        right: size * 0.12,
        top: size * 0.12 + headBandRadius - 2,
      }} />
      <View style={{
        width: size * 0.25,
        height: size * 0.22,
        borderBottomWidth: 1.8,
        borderLeftWidth: 1.8,
        borderColor: color,
        borderBottomLeftRadius: 8,
        position: 'absolute',
        bottom: size * 0.15,
        left: size * 0.2,
      }} />
    </View>
  );
}


