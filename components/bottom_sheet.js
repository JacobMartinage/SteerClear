import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

const Bottomcomp = () => {
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
          snapPoints={['20%', '100%']}
          index={0}
          enableDismissOnClose={false}
          enablePanDownToClose = {false}
          topInset={200}
        >
          <BottomSheetView style={styles.contentContainer}>
          <BottomSheetTextInput style={styles.input} placeholder='Search' />
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', 
       flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    minHeight: '20%', 
    backgroundColor: 'transparent', 

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

export default Bottomcomp;
