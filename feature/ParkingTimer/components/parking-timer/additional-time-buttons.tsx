import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

type AdditionalTimeButtonsProps = {
  addMinutes: (minutes: number) => void;
};

const AdditionalTimeButtons = ({ addMinutes }: AdditionalTimeButtonsProps) => {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity onPress={() => addMinutes(15)} style={styles.button}>
        <Text style={styles.buttonText}>+15m</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => addMinutes(30)} style={styles.button}>
        <Text style={styles.buttonText}>+30m</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => addMinutes(60)} style={styles.button}>
        <Text style={styles.buttonText}>+60m</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => addMinutes(1440)} style={styles.button}>
        <Text style={styles.buttonText}>+24h</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e5e5e2',
    borderRadius: 22,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
  },
});

export default AdditionalTimeButtons;
