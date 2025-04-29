import {
  View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    StyleSheet,
    ScrollView,
    Platform,
  } from "react-native";
  import { Picker } from "@react-native-picker/picker";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { ArrowLeftIcon } from "react-native-heroicons/solid";
  import { useNavigation } from "@react-navigation/native";
  import React, { useState } from "react";
  import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
  import { addDoc, collection, getFirestore } from "firebase/firestore";
  import { auth, database } from "../../firebase"
  import { getDatabase, ref, set } from "firebase/database";
  import { Alert } from "react-native";
  import Button from "../components/Button";
  import { COLORS, themeColors } from "../FixeDesign/desi";
  
  const SignUpScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");    
    const [role, setRole] = useState("user");
    const [errorMessage, setErrorMessage] = useState(null); // State for error message
    const [gender, setGender] = useState("female"); // Set initial value to "female"
    const [isLoading, setIsLoading] = useState(false);
    console.warn = () => {};
  
    const auth = getAuth();
    const db = getFirestore();
  
    const isValidEmail = (email) => {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return emailRegex.test(email);
    };

    const isValidName = (name) => {
      const nameRegex = /^[A-Za-zא-ת]+$/; // מאפשר רק אותיות באנגלית ובעברית
      return nameRegex.test(name);
    };
    
    const handleSubmit = async () => {
      if (!email || !password || !firstName || !lastName) {
        Alert.alert("שגיאה", "אנא מלא את כל השדות הדרושים");
        return;
      }
    
      if (!isValidName(firstName)) {
        Alert.alert("שגיאה", "שם פרטי יכול להכיל רק אותיות בעברית או באנגלית");
        return;
      }
    
      if (!isValidName(lastName)) {
        Alert.alert("שגיאה", "שם משפחה יכול להכיל רק אותיות בעברית או באנגלית");
        return;
      }
    
      if (!isValidEmail(email)) {
        Alert.alert("שגיאה", "האימייל שהזנת אינו תקין");
        return;
      }
    
      if (password.length < 8) {
        Alert.alert("שגיאה", "הסיסמה חייבת להכיל לפחות 8 תווים");
        return;
      }


    
      setIsLoading(true); // הפעל טעינה
    
      try {
        const authUser = await createUserWithEmailAndPassword(auth, email, password);
        const database = getDatabase();
        const usersRef = ref(database, `users/${authUser.user.uid}`);
        console.log("Attempting to set user data in Realtime Database:", {
          email: authUser.user.email,
          firstName: firstName,
          lastName: lastName,
          role: "user",
          profileImage: gender,
        });
        await set(usersRef, {
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: "user",
          profileImage: gender,
        });
        Alert.alert("הרשמה בוצעה בהצלחה!", "ברוך הבא למערכת!");
        navigation.navigate("SignInScreen");
      }catch (err) {
        console.error("Error setting user data in Realtime Database:", err);
      
    
        // טיפול בשגיאות והצגת הודעת שגיאה
        if (err.code === 'auth/email-already-in-use') {
          Alert.alert("שגיאה", "משתמש רשום");
        } else if (err.code === 'auth/invalid-email') {
          Alert.alert("שגיאה", "אימייל לא תקין.");
        } else if (err.code === 'auth/weak-password') {
          Alert.alert("שגיאה", "הסיסמה חלשה מדי.");
        } else {
          Alert.alert("שגיאה", "התרחשה שגיאה בלתי צפויה, אנא נסה שוב מאוחר יותר.");
        }
      } finally {
        setIsLoading(false); // עצור טעינה
      }
    };
    
  
    const pageFormView = () => {
      return (
      <View style={styles.formContainer}>
        <View style={styles.form}>
        <Text style={styles.formLabel}>שם פרטי</Text>
<TextInput
  autoCompleteType="name"
  style={styles.input}
  value={firstName}
  onChangeText={(value) => setFirstName(value)}
  placeholder="הכנס שם פרטי"
/>

<Text style={styles.formLabel}>שם משפחה</Text>
<TextInput
  autoCompleteType="name"
  style={styles.input}
  value={lastName}
  onChangeText={(value) => setLastName(value)}
  placeholder="הכנס שם משפחה"
/>
          <Text style={styles.formLabel}>אימייל</Text>
          <TextInput
            autoCompleteType="email"
            style={styles.input}
            value={email}
            onChangeText={(value) => setEmail(value)}
            placeholder="הכנס אימייל"
          />
          <Text style={styles.formLabel}>סיסמה</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={(value) => setPassword(value)}
            placeholder="הכנס סיסמה"
          />
        
  
          <Text style={styles.formLabel}>מגדר</Text>
          <Picker
            style={styles.input}
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
          >
            <Picker.Item label="אישה" value="female" />
            <Picker.Item label="גבר" value="male" />
            <Picker.Item label="אחר" value="other" />
          </Picker>
  
          <Button
            title="הרשמה"
            onPress={handleSubmit}
            buttonStyle={{ backgroundColor: COLORS.buttonColor }}
            textStyle={{ color: "#475569" }}
          />
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
        </View>
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>משתמש קיים?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignInScreen")}>
            <Text style={styles.loginLink}>התחברות</Text>
          </TouchableOpacity>
        </View>
      </View>)
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
        {Platform.OS === "ios" ? (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {pageFormView()}
      </ScrollView>
    ) : (
      pageFormView()
    )}
    </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1, // מאפשר למסך להשתמש בכל הגובה
      backgroundColor: COLORS.buttonColor,
    },
    safeArea: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },
    iconContainer: {
      justifyContent: "flex-start",
    },
    backButton: {
      backgroundColor: COLORS.buttonColor,
      padding: 10,
      borderRadius: 10,
      marginLeft: 4,
    },
    imageContainer: {
      width: "100%", // הלוגו יתפוס את כל רוחב המסך
      alignItems: "center", // ממרכז את הלוגו לרוחב
      marginBottom: 10, // ריווח בין הלוגו לטופס
    },
    logo: {
      width: 200, // הגודל של הלוגו ברוחב
      height: 250, // הגובה של הלוגו
      resizeMode: "contain", // שומר על פרופורציות
      position: "absolute", // ממקם את הלוגו באופן מוחלט
      right: 0, // ממקם את הלוגו בצד ימין
      top: 0, // ממקם את הלוגו בחלק העליון של המסך
    },
    formContainer: {
      flex: 1, // הטופס ימלא את השטח שנשאר
      backgroundColor: "white",
      paddingHorizontal: 16,
      paddingTop: 16,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      marginTop: 120, // זה יוסיף רווח מעל הטופס ויוריד אותו למטה
      width: "100%", // רוחב מלא של הטופס
    },
    form: {
      paddingTop: 8,
      paddingBottom: 16,
    },
   formLabel: {
  color: "#475569",
  marginLeft: 16,
  marginBottom: 4,
  textAlign: 'right',  // זה יזיז את הכתוב לימין
},
input: {
  padding: 16,
  backgroundColor: "#F3F4F6",
  color: "#475569",
  borderRadius: 10,
  marginBottom: 16,
  textAlign: 'right', // הכתב בתוך ה-TextInput יהיה לימין
},
    signupButton: {
      padding: 16,
      backgroundColor: COLORS.buttonColor,
      borderRadius: 10,
      marginHorizontal: 16,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      color: "#475569",
    },
    orText: {
      fontSize: 20,
      color: "#475569",
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 16,
    },
    socialButtonsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 12,
    },
    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 16,
    },
    loginText: {
      color: "#475569",
      fontWeight: "600",
    },
    loginLink: {
      color: COLORS.buttonColor,
      fontWeight: "600",
      marginLeft: 4,
    },
  });
  
  export default SignUpScreen;