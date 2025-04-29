import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Button, TextInput, Alert, Keyboard, TouchableWithoutFeedback, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { auth } from "../../firebase"; 
import { getDatabase, ref, onValue, push, set, update } from "firebase/database";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';


const manImage = require("../assets/images/man.png");
const womanImage = require("../assets/images/woman.png");

const UserHomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [modalView, setModalView] = useState("main"); // "main" או "editProfile"
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isEmergencyModalVisible, setIsEmergencyModalVisible] = useState(false);




  
  // States לעדכון פרופיל
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  
  const user = auth.currentUser; 
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`); 
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          // עדכון השדות לערכים הנוכחיים מהבסיס
          setNewFirstName(data.firstName || "");
          setNewLastName(data.lastName || "");
          const contactRef = ref(db, `users/${user.uid}/emergencyContact`);
          onValue(contactRef, (contactSnap) => {
          if (contactSnap.exists()) {
            setEmergencyContact(contactSnap.val());
          } else {
            setEmergencyContact(null);
          }
        });

        } else {
          setUserData(null); 
        }
        setLoading(false); 
      });
    } else {
      setLoading(false); 
      navigation.reset({
        index: 0, 
        routes: [{ name: 'WelcomeScreen' }] 
      });
    }
  }, [user, navigation]);

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert("⚠️ שגיאה", "אנא הכנס פידבק.");
      return;
    }
    if (!user) {
      Alert.alert("⚠️ שגיאה", "אנא התחבר קודם.");
      return;
    }
    try {
      const db = getDatabase();
      const newFeedbackRef = push(ref(db, "feedbacks"));
      await set(newFeedbackRef, {
        email: user.email,
        feedback: feedback,
        rating: rating,
        timestamp: new Date().toISOString(),
      });
      Alert.alert("הפידבק נשלח בהצלחה!");
      setFeedback("");
      setRating(5);
      setIsFeedbackModalVisible(false);
    } catch (error) {
      Alert.alert("⚠️ שגיאה", "לא ניתן לשלוח פידבק כרגע.");
      console.error(error);
    }
  };

  const saveProfileChanges = async () => {
    if (!newFirstName.trim() || !newLastName.trim()) {
      Alert.alert("⚠️ שגיאה", "אנא מלא את כל השדות.");
      return;
    }
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        firstName: newFirstName,
        lastName: newLastName,
      });
      Alert.alert("הפרטים עודכנו בהצלחה!");
      setModalView("main");
    } catch (error) {
      Alert.alert("⚠️ שגיאה", "לא ניתן לעדכן את הפרטים כרגע.");
      console.error(error);
    }
  };
  const addNewContact = async () => {
    const db = getDatabase();
    const contactRef = ref(db, `users/${user.uid}/emergencyContact`);
  
    await set(contactRef, {
      firstName: contactFirstName,
      lastName: contactLastName,
      phone: contactPhone,
    });
  
    setEmergencyContact({
      firstName: contactFirstName,
      lastName: contactLastName,
      phone: contactPhone,
    });
  
    // איפוס השדות (רשות)
    setContactFirstName("");
    setContactLastName("");
    setContactPhone("");
  
    setModalView("editContact");
  };
  

  

  const resetPassword = async () => {
    if (!user || !user.email) {
      Alert.alert("⚠️ שגיאה", "אין כתובת אימייל זמינה.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("הוראות לאיפוס סיסמא נשלחו לכתובת האימייל שלך!");
    } catch (error) {
      Alert.alert("⚠️ שגיאה", "אירעה שגיאה בעת שליחת האימייל לאיפוס הסיסמא.");
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // לאחר ההתנתקות, מאפסים את הניווט למסך ההתחברות
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    } catch (error) {
      Alert.alert("⚠️ שגיאה", "אירעה שגיאה בעת ההתנתקות.");
      console.error(error);
    }
  };

  const handleEmergencyCall = () => {
    if (!emergencyContact?.phone) {
      // אם אין איש קשר חירום – חייג ישר למד"א
      Linking.openURL(`tel:101`);
      return;
    }
  
    Alert.alert(
      "בחר איש קשר לחירום",
      "למי ברצונך להתקשר?",
      [
        {
          text: `${emergencyContact.firstName} ${emergencyContact.lastName}`,
          onPress: () => Linking.openURL(`tel:${emergencyContact.phone}`),
        },
        {
          text: "מגן דוד אדום (101)",
          onPress: () => Linking.openURL(`tel:101`),
        },
        {
          text: "ביטול",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };
  

  return (
    <View style={styles.container}>
      {/* header ושאר הקוד */}
      <View style={styles.header}>
        <Image source={require("../assets/images/raft.jpeg")} style={styles.backgroundImage} />
        <View style={styles.profileContainer}>
          <Image source={userData?.profileImage === 'female' ? womanImage : manImage} style={styles.profileImage} />
          <Text style={styles.welcomeText}>
            ברוך הבא, {userData ? `${userData.firstName} ${userData.lastName}` : 'אורח'}
          </Text>
          <Text style={styles.subText}>איך אפשר לעזור לך היום?</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.profileButton} onPress={() => { setModalView("main"); setIsModalVisible(true); }}>
        <Text style={styles.profileButtonText}> הפרופיל שלי</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.menu}>
        <MenuItem icon="🗨️" title="שוחח עם AI" />
        <MenuItem icon="📝" title="פוסטים אנונימיים" onPress={() => navigation.navigate("PostScreen")} />
        <MenuItem icon="🧑‍⚕️" title="מצא מטפל" />
        <MenuItem icon="📚" title="זכויות ומידע"  onPress={() => navigation.navigate("RightsInfoScreen")}/>
        <MenuItem icon="🚨" title="כפתור חירום"  onPress={() => setIsEmergencyModalVisible(true)} />
        <MenuItem icon="🎭" title="אירועים קרובים" onPress={() => navigation.navigate('NearbyEventsScreen')} />
        <MenuItem icon="📢" title="משוב ודיווח" onPress={() => setIsFeedbackModalVisible(true)} />
      </ScrollView>

      {/* Modal של פרופיל */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalView === "main" ? (
              <>
                <Text style={styles.modalTitle}>אפשרויות פרופיל</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalView("editProfile")}>
                  <Text style={styles.modalButtonText}>שינוי פרטים אישיים</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={resetPassword}>
                  <Text style={styles.modalButtonText}>שינוי סיסמא</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalView("editContact")}>
                  <Text style={styles.modalButtonText}>איש קשר לחירום</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButton} onPress={handleSignOut}>
                  <Text style={styles.modalButtonText}>התנתקות</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>סגור</Text>
                </TouchableOpacity>
              </>
            ) : modalView === "editProfile" ? (
              <>
                <Text style={styles.modalTitle}>שינוי פרטים אישיים</Text>
                <TextInput
                  style={styles.input}
                  placeholder="שם פרטי"
                  value={newFirstName}
                  onChangeText={setNewFirstName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="שם משפחה"
                  value={newLastName}
                  onChangeText={setNewLastName}
                  placeholderTextColor="#a9a9a9"

                />
                <TouchableOpacity style={styles.modalButton} onPress={saveProfileChanges}>
                  <Text style={styles.modalButtonText}>שמור שינויים</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalView("main")} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>חזור</Text>
                </TouchableOpacity>
              </> 
              ) : modalView === "editContact" ? (
                <>
                  <Text style={styles.modalTitle}>איש קשר לחירום</Text>
              
                  {emergencyContact ? (
                    <>
                      <Text style={styles.label}>שם פרטי: {emergencyContact.firstName}</Text>
                      <Text style={styles.label}>שם משפחה: {emergencyContact.lastName}</Text>
                      {emergencyContact.phone && <Text style={styles.label}>טלפון: {emergencyContact.phone}</Text>}
                      <TouchableOpacity
  onPress={() => {
    setContactFirstName(emergencyContact.firstName || "");
    setContactLastName(emergencyContact.lastName || "");
    setContactPhone(emergencyContact.phone || "");
    setModalView("editContactForm");
  }}
  style={styles.modalButton}
>
  <Text style={styles.modalButtonText}>ערוך</Text>
</TouchableOpacity>

                    </>
                  ) : (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="שם פרטי"
                        value={contactFirstName}
                        onChangeText={setContactFirstName}
                        
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="שם משפחה"
                        value={contactLastName}
                        onChangeText={setContactLastName}
                      />

                      <TextInput
                        style={styles.input}
                        placeholder="טלפון"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                      />
                      <TouchableOpacity onPress={addNewContact} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>הוסף איש קשר</Text>
                      </TouchableOpacity>
                    </>
                  )}
              
                  <TouchableOpacity onPress={() => setModalView("main")} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>חזור</Text>
                  </TouchableOpacity>
                </>

            ) : modalView === "editContactForm" ? ( 
           <>
             <Text style={styles.modalTitle}>עריכת איש קשר לחירום</Text>

            <TextInput
      style={styles.input}
      placeholder="שם פרטי"
      placeholderTextColor="#555"
      value={contactFirstName}
      onChangeText={setContactFirstName}
    />
    <TextInput
      style={styles.input}
      placeholder="שם משפחה"
      placeholderTextColor="#555"
      value={contactLastName}
      onChangeText={setContactLastName}
    />
    <TextInput
      style={styles.input}
      placeholder="טלפון"
      placeholderTextColor="#555"
      value={contactPhone}
      onChangeText={setContactPhone}
    />

    <TouchableOpacity onPress={addNewContact} style={styles.modalButton}>
      <Text style={styles.modalButtonText}>שמור איש קשר</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => setModalView("editContact")} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>חזור</Text>
    </TouchableOpacity>
  </>
              
            ) : null}

           
          </View>
        </View>
      </Modal>
        
        {/* Modal כפתור חירום */}
      <Modal visible={isEmergencyModalVisible} animationType="fade" transparent={true}>
  <View style={styles.modalOverlay}>
    <View style={styles.emergencyContainer}>
      <Text style={styles.modalTitle}>מקרה חירום</Text>

      <View style={styles.emergencyBoxes}>
        <TouchableOpacity style={styles.emergencyBox} onPress={handleEmergencyCall}>
          <Ionicons name="call-outline" size={30} color="#005A8D" />
          <Text style={styles.emergencyText}>שיחת מצוקה</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emergencyBox}>
          <Ionicons name="alert-circle-outline" size={30} color="#005A8D" />
          <Text style={styles.emergencyText}>הנחיות למצב חירום</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setIsEmergencyModalVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>סגור</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      {/* Modal פידבק */}
      <Modal visible={isFeedbackModalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>משוב ודיווח</Text>
              <TextInput
                style={styles.input}
                placeholder="כתוב כאן את הפידבק שלך..."
                value={feedback}
                onChangeText={setFeedback}
                multiline
              />
              <Text style={styles.label}>דירוג:</Text>
              <View style={styles.rating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Text style={styles.star}>{star <= rating ? "★" : "☆"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.modalButton} onPress={submitFeedback}>
                <Text style={styles.modalButtonText}>שלח פידבק</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsFeedbackModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const MenuItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuText}>{icon} {title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    position: 'relative',
    height: 250,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileContainer: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subText: {
    fontSize: 14,
    color: '#555',
  },
  profileButton: {
    marginTop: 50,
    marginHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#005A8D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menu: {
    marginTop: 20,
    paddingBottom: 30,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    marginVertical: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuText: {
    fontSize: 18,
    textAlign: 'right',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#005A8D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '005A8D',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 10,
    textAlign: 'right',
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: "#333",
  },
  rating: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  star: {
    fontSize: 24,
    marginHorizontal: 5,
    color: '#FFD700',
  },
  emergencyContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: 320,
  },
  emergencyBoxes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  emergencyBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
    resizeMode: "contain",
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#005A8D",
    marginTop: 10,

  },
  
});

export default UserHomeScreen;