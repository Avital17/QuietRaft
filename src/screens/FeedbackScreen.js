import React, { useState, useEffect } from "react";
import { getDatabase, ref, push, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { View, Text, TextInput, Button } from "react-native";
import { Rating } from 'react-native-ratings';  // שימוש בספרייה החדשה

const FeedbackScreen = () => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [userData, setUserData] = useState(null); // נתוני המשתמש

  // נרצה לוודא שהמשתמש מחובר
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData({
          firstName: user.displayName, // שם פרטי (אם זמין)
          email: user.email,            // אימייל של המשתמש
        });
      } else {
        setUserData(null); // אם המשתמש לא מחובר
      }
    });

    return () => unsubscribe(); // ביטול המעקב כשנפסיק להשתמש בו
  }, []);

  const handleSubmit = async () => {
    if (feedback && rating > 0 && userData) {
      try {
        // שמירת הפידבק בדאטה בייס
        const database = getDatabase();
        const feedbackRef = ref(database, 'feedback/');
        const newFeedbackRef = push(feedbackRef);
        await set(newFeedbackRef, {
          name: `${userData.firstName}`,
          email: userData.email,
          feedback: feedback,
          rating: rating,
          timestamp: new Date().toISOString()
        });
        
        alert("Feedback submitted successfully!");
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  if (!userData) {
    return <Text>Please log in to submit feedback.</Text>; // אם המשתמש לא מחובר
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Provide Your Feedback</Text>
      
      <View style={{ marginVertical: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{userData.firstName}</Text>
        <Text style={{ fontSize: 18 }}>Email: {userData.email}</Text>
      </View>
      
      <TextInput
        value={feedback}
        onChangeText={(text) => setFeedback(text)}
        placeholder="Write your feedback here..."
        style={{
          height: 100,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          textAlignVertical: "top",
        }}
        multiline
      />
      
      <View style={{ marginBottom: 10 }}>
        <Rating
          type='star'
          ratingCount={5}
          imageSize={30}
          startingValue={rating}
          onFinishRating={setRating}  // עדכון הדירוג
        />
      </View>

      <Button title="Submit Feedback" onPress={handleSubmit} />
    </View>
  );
};

export default FeedbackScreen;