import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export const COLORS = {
  success: "#00C851",
  error: "#ff4444",

  black: "#000000",
  white: "#FFFFFF",
  backgroundcolor: "#bae6fd",
  backgroundImage: require("../assets/Browncute.jpg"),
  border: "#F5F5F7",
  buttonColor: "#86B3BD",
  gray:  "#737373",

  primary: "#FFF3E4",
  secondary:"#ec8944",
  accent:"#F79F69",
  background: "#FFF3E4",
  nextButton: "#F79F69",
};

export const SIZES = {
  base: 10,
  width,
  height,
};

export const themeColors = {
  bg: "#A2AAFC",
};