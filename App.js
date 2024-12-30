import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import "react-native-gesture-handler";
import AuthStackNavigator from "./src/navigators/AuthStackNavigator";
import { COLORS } from "./src/FixeDesign/desi";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Your log message here"]);

export default function App() {
  return <AuthStackNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  content: {
    flex: 1,
    zIndex: 1, // Ensure that the content is layered above the background image
  },
});