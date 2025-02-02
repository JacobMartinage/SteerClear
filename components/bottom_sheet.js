import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

const HomeScreen = () => {
  const bottomSheetModalRef = useRef(null);

  const handlePresentModal = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
    }
  }, []);

  useEffect(() => {
    handlePresentModal();
  }, [handlePresentModal]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={['20%', '60%']}
          index={0}
          enableDismissOnClose={false}
          enablePanDownToClose = {false}
          topInset={100}
        >
          <BottomSheetView style={styles.contentContainer}>
          <BottomSheetTextInput style={styles.input} placeholder='search' />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    minHeight: '20%', 
  },
  input: {
    width: '90%', 
    padding: 10, 
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
    overflow: 'hidden', 
  },
});

export default HomeScreen;
