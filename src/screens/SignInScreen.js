import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "react-native-heroicons/solid";
import { COLORS } from "../FixeDesign/desi";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Button from "../components/Button";
import { getDoc, doc } from "firebase/firestore";
import { get, ref } from "firebase/database";
import { db } from "../firebase"; // יש לוודא ש`db` מאופשר


const SignInScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  console.warn = () => {};

  const handleSubmit = async () => {
    if (email && password) {
      try {
        // התחברות עם אימייל וסיסמה
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User UID after sign-in:", userCredential.user.uid);
  
        // שליפת המידע על המשתמש מ-Realtime Database
       // הדפסת ה-role
  
          // בדיקת ה-role של המשתמש
        // הצגת הודעת שגיאה במקרה של כשלון

            navigation.navigate("UserHomeScreen");  // לדף אדמין אם התפקיד הוא אחר
       
      } catch (err) {
        console.log("Got error:", err.message);
        alert("Error: " + err.message);  // הצגת הודעת שגיאה במקרה של כשלון
      }
    } else {
      alert("בבקשה תמלא את כל הפרטים");  // הודעה אם השדות ריקים
    }
  };
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeftIcon size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
        </View>
      </SafeAreaView>
      <View style={styles.formContainer}>
        <View style={styles.form}>
          <Text style={styles.formLabel}>אימייל</Text>
          <TextInput
            style={styles.input}
            placeholder="הכנס אימייל"
            value={email}
            onChangeText={setEmail}
            autoCompleteType="email"
          />
          <Text style={styles.formLabel}>סיסמה</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="הכנס סיסמה"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>שכחת סיסמה?</Text>
          </TouchableOpacity>
          <Button
            title={ "התחברות"}
            onPress={handleSubmit}
            buttonStyle={{ backgroundColor: COLORS.buttonColor }}
            textStyle={{ color: "#475569" }}
          />
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>לא קיים משתמש?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
            <Text style={styles.signupLink}> הרשמה </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.buttonColor, // צבע הרקע יהיה הצבע של הכפתור
    },
    safeArea: {
      flexDirection: "row",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    iconContainer: {
      justifyContent: "flex-start",
    },
    backButton: {
      padding: 10,
      borderRadius: 10,
      marginLeft: 4,
    },
    imageContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
    },
    logo: {
      width: 350,
      height: 180,
    },
    formContainer: {
      flex: 1,
      backgroundColor: "white",
      paddingHorizontal: 16,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      marginTop: 100, // הגדלתי את ה-marginTop להורדה נוספת של התבנית למטה
    },
    form: {
      paddingTop: 8,
      paddingBottom: 16,
    },
    formLabel: {
      color: "#475569",
      marginLeft: 16,
      marginBottom: 4,
      textAlign: "right",
    },
    input: {
      padding: 16,
      backgroundColor: "#F3F4F6",
      color: "#475569",
      borderRadius: 10,
      marginBottom: 16,
    },
    forgotPassword: {
      flex: 1,
      alignItems: "flex-end",
      marginBottom: 5,
    },
    forgotPasswordText: {
      color: "#475569",
      marginBottom: 5,
      textAlign: "right",
    },
    loginButton: {
      padding: 16,
      borderRadius: 10,
      marginHorizontal: 16,
      backgroundColor: COLORS.buttonColor,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      color: "white",
    },
    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 7,
    },
    signupText: {
      color: "#475569",
      fontWeight: "600",
    },
    signupLink: {
      color: COLORS.buttonColor,
      fontWeight: "600",
      marginLeft: 4,
    },
  });
export default SignInScreen;