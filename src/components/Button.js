import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
//title-טקסט שמוצג על גבי הכפתור
//onPress-פונקציה שנקראת כאשר הכפתור נלחץ


const Button = ({ title, onPress, buttonStyle, textStyle }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle]}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    backgroundColor: "#F6E05E",
    borderRadius: 10,
    marginHorizontal: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#475569",
  },
});

export default Button;