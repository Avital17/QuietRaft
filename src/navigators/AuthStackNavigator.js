import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { useNavigation } from '@react-navigation/native'; // הוספנו את ה-hook
import WelcomeScreen from "../screens/WelcomeScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import UserHomeScreen from "../screens/UserHomeScreen";
import NearbyEventsScreen from "../screens/NearbyEventsScreen";
import FeedbackScreen from "../screens/FeedbackScreen";
 // ייבוא המסך החדש

import { auth } from "../firebase"; // ייבוא Firebase

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen">
        {/* מסך ראשוני - WelcomeScreen */}
        <Stack.Screen
          name="WelcomeScreen"
          options={{ headerShown: false }}
          component={WelcomeScreen}
        />

        {/* מסך הרשמה */}
        <Stack.Screen
          name="SignUpScreen"
          options={{ headerShown: false }}
          component={SignUpScreen}
        />
        <Stack.Screen
          name="FeedbackScreen"
          options={{ headerShown: false }}
          component={FeedbackScreen}
        />

        {/* מסך התחברות */}
        <Stack.Screen
          name="SignInScreen"
          options={{ headerShown: false }}  // אם אתה לא רוצה להציג את כותרת המסך
          component={SignInScreen}
        />

        {/* דף הבית של המשתמש */}
        <Stack.Screen
          name="UserHomeScreen"
          options={{ headerShown: false }}
          component={UserHomeScreen}
        />
        <Stack.Screen
          name="NearbyEventsScreen"
          options={{ headerShown: false }}
          component={NearbyEventsScreen}
        />
         
  
      </Stack.Navigator>
    </NavigationContainer>
  );
}