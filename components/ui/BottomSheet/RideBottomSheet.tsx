/**
 * RideBottomSheet Component
 * 
 * Bottom sheet with 3 snap points: 30% (default), 90% (search), 40% (vehicle/confirm/searching)
 */

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';

interface RideBottomSheetProps {
  children: React.ReactNode;
  snapPoints: string[];
  index: number;
  onChange?: (index: number) => void;
  enablePanDownToClose?: boolean;
  backgroundStyle?: any;
}

export interface RideBottomSheetRef {
  snapToIndex: (index: number) => void;
}

const RideBottomSheet = React.forwardRef<RideBottomSheetRef, RideBottomSheetProps>(({
  children,
  snapPoints,
  index,
  onChange,
  enablePanDownToClose = false,
  backgroundStyle,
}, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  useImperativeHandle(ref, () => ({
    snapToIndex: (idx: number) => {
      bottomSheetRef.current?.snapToIndex(idx);
    },
  }));

  const handleSheetChanges = useCallback((newIndex: number) => {
    if (onChange) {
      onChange(newIndex);
    }
  }, [onChange]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={index}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={enablePanDownToClose}
      backgroundStyle={[styles.background, backgroundStyle]}
      handleIndicatorStyle={styles.handleIndicator}
      enableHandlePanningGesture={true}
      enableContentPanningGesture={true}
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.contentContainer}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
});

RideBottomSheet.displayName = 'RideBottomSheet';

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#E0E0E0',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
  },
});

export default RideBottomSheet;

