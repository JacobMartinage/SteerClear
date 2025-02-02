import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

const Bottomcomp = () => {
  const bottomSheetModalRef = useRef(null);
  const [query, setQuery] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);

  const handlePresentModal = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
    }
  }, []);

  useEffect(() => {
    handlePresentModal();
  }, [handlePresentModal]);

  useEffect(() => {
    if (query.length > 0) {
      fetch(`https://api.mapbox.com/search/autofill/v1/${query}?access_token=pk.my.token&country=us`)
        .then((response) => response.json())
        .then((data) => {
          if (data.suggestions) {
            setFilteredAddresses(data.suggestions.map(suggestion => suggestion.place_name));
          }
        })
        .catch((error) => console.error('Error fetching addresses:', error));
    } else {
      setFilteredAddresses([]);
    }
  }, [query]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={['20%', '50%']}
          index={0}
          enableDismissOnClose={false}
          enablePanDownToClose = {false}
          topInset={200}
        >
          <BottomSheetView style={styles.contentContainer}>
            <BottomSheetTextInput
              style={styles.input}
              placeholder='Search'
              value={query}
              onChangeText={setQuery}
            />
            <FlatList
              data={filteredAddresses}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItem}>
                  <Text style={styles.listText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
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
  listItem: {
    padding: 10,
    width: '90%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listText: {
    fontSize: 16,
  },
});

export default Bottomcomp;
