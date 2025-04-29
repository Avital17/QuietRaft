import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Alert, SafeAreaView, ActivityIndicator 
} from "react-native";
import { Rating } from 'react-native-ratings';
import emailjs from "@emailjs/browser";
import * as Location from "expo-location"; // ✅ שימוש ב-Location

const FeedbackScreen = () => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [location, setLocation] = useState(null); // ✅ שמירת מיקום (קו רוחב ואורך)
  const [address, setAddress] = useState("מיקום לא ידוע"); // ✅ שם המקום (עיר + רחוב)
  const [errorMsg, setErrorMsg] = useState(null); // ✅ הודעת שגיאה למיקום

  // ✅ קבלת המיקום של המשתמש
  const [userData, setUserData] = useState(null);

useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserData({
        firstName: user.displayName,
        email: user.email,
      });
    } else {
      setUserData(null);
    }
  });

  return () => unsubscribe();
}, []);

  

  // ✅ שליחת אימייל דרך EmailJS
  const sendEmail = async (feedbackData) => {
    try {
      console.log("📩 שולח אימייל עם הנתונים:", JSON.stringify(feedbackData, null, 2));
  
      // ✅ ודא שלמיקום יש ערך תקף
      if (!feedbackData.location) {
        console.warn("⚠️ מיקום חסר! נוסיף ברירת מחדל (ישראל)");
        feedbackData.location = "32.0853, 34.7818"; // 🇮🇱 ישראל כברירת מחדל
      }
  
      await emailjs.send(
        "service_2wcm8fd",
        "template_vpgvxgy",
        feedbackData,
        "yoZMzTLe7qTiU0OaY"
      );
  
      console.log("✅ אימייל נשלח בהצלחה!");
    } catch (error) {
      console.error("❌ שגיאה בשליחת המייל:", error);
      setErrorMessage("הייתה שגיאה בשליחת האימייל.");
    }
  };
  

  // ✅ שליחת המשוב
  const handleSubmit = async () => {
    if (!feedback || rating === 0) {
      Alert.alert("שגיאה", "יש למלא את כל השדות");
      return;
    }
  
    if (!userData) {
      Alert.alert("שגיאה", "עליך להתחבר כדי לשלוח משוב.");
      return;
    }
  
    if (!location) {
      console.warn("⚠️ המיקום עדיין לא נטען, משתמשים בברירת מחדל (ישראל)");
      setLocation({ latitude: 32.0853, longitude: 34.7818 }); // 🇮🇱 ישראל
    }
  
    setIsLoading(true);
  
    try {
      const feedbackData = {
        name: userData.firstName, // ✅ שם המשתמש המחובר
        email: userData.email, // ✅ המייל של המשתמש המחובר
        feedback,
        rating,
        timestamp: new Date().toISOString(),
        location: location 
          ? `${location.latitude}, ${location.longitude}`
          : "32.0853, 34.7818", // 🇮🇱 ישראל כברירת מחדל
      };
      console.log("📌 בדיקה: location בתוך feedbackData לפני השליחה:", feedbackData.location);

      console.log("📥 נתוני הפידבק שנשלחים:", JSON.stringify(feedbackData, null, 2));
      console.log("🟢 משתמש מחובר:", userData);

      await sendEmail(feedbackData);
      Alert.alert("תודה!", "המשוב שלך נשלח בהצלחה");
  
      // ✅ איפוס השדות
      setFeedback("");
      setRating(0);
    } catch (error) {
      console.error("❌ שגיאה בשליחת הפידבק:", error);
      setErrorMessage("הייתה שגיאה בשליחת הפידבק.");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e6f2ff" }}>
      <ScrollView contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 150,
      }}>
        <View style={{
          backgroundColor: "#fff",
          borderRadius: 15,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 15,
            color: "#333",
          }}>
            נשמח לקבל משוב ממך!
          </Text>

          <TextInput
            value={feedback}
            onChangeText={setFeedback}
            placeholder="כתוב כאן את המשוב שלך..."
            placeholderTextColor="#999"
            style={{
              height: 120,
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 10,
              padding: 15,
              backgroundColor: "#f9f9f9",
              textAlignVertical: "top",
              marginBottom: 20,
            }}
            multiline
          />

          <View style={{ marginBottom: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#555", marginBottom: 10 }}>
              דרג אותנו:
            </Text>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={35}
              startingValue={rating}
              onFinishRating={setRating}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: "#007bff",
              paddingVertical: 15,
              borderRadius: 10,
              alignItems: "center",
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                שליחת משוב
              </Text>
            )}
          </TouchableOpacity>

          {errorMessage && (
            <Text style={{ color: "red", marginTop: 10 }}>{errorMessage}</Text>
          )}

          {errorMsg && <Text style={{ color: "red", textAlign: "center" }}>{errorMsg}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FeedbackScreen;
