import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircleIcon } from '../icons';
import { useThemeColors, ThemeColors } from '../../theme/colors';

export interface TrackingStep {
  id: string;
  title: string;
  subtitle: string;
}

interface TrackingTimelineProps {
  steps: TrackingStep[];
  currentStepIdx: number;
}

export default function TrackingTimeline({
  steps,
  currentStepIdx,
}: TrackingTimelineProps) {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.cardSection}>
      <Text style={styles.cardSectionTitle}>Delivery Timeline</Text>
      <View style={styles.stepperContainer}>
        {steps.map((step, idx) => {
          const isPassed = currentStepIdx >= idx;
          const isCurrent = currentStepIdx === idx;
          const isLast = idx === steps.length - 1;

          return (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepNode,
                    isPassed && styles.stepNodePassed,
                    isCurrent && styles.stepNodeCurrent,
                  ]}
                >
                  {isPassed ? (
                    <CheckCircleIcon size={12} color="#FFFFFF" />
                  ) : (
                    <View style={styles.stepNodeInner} />
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.stepConnector,
                      isPassed && styles.stepConnectorPassed,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepTextCol}>
                <View style={styles.stepTitleRow}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isPassed && styles.stepTitlePassed,
                      isCurrent && styles.stepTitleCurrent,
                    ]}
                  >
                    {step.title}
                  </Text>
                  {isCurrent && (
                    <View style={styles.currentChip}>
                      <Text style={styles.currentChipText}>In Progress</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#F1F3F5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    cardSectionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
    },
    stepperContainer: {
      paddingLeft: 4,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    stepIndicatorCol: {
      alignItems: 'center',
      width: 24,
      marginRight: 12,
    },
    stepNode: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNodePassed: {
      backgroundColor: '#10B981',
    },
    stepNodeCurrent: {
      backgroundColor: colors.primary,
      transform: [{ scale: 1.15 }],
    },
    stepNodeInner: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#9CA3AF',
    },
    stepConnector: {
      width: 2,
      height: 28,
      backgroundColor: '#E5E7EB',
      marginVertical: 2,
    },
    stepConnectorPassed: {
      backgroundColor: '#10B981',
    },
    stepTextCol: {
      flex: 1,
      paddingBottom: 16,
    },
    stepTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    stepTitlePassed: {
      color: colors.text,
      fontWeight: '700',
    },
    stepTitleCurrent: {
      color: colors.primary,
      fontWeight: '800',
    },
    currentChip: {
      backgroundColor: '#FFF4EB',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    currentChipText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#E85D22',
    },
    stepSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
  });
