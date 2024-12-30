import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // ייבוא ניווט
import { auth } from "../firebase"; // קובץ ההגדרות של Firebase
import { getDatabase, ref, onValue } from "firebase/database";


const manImage = require("../assets/images/man.png");
const womanImage = require("../assets/images/woman.png");

const UserHomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // מצב המודאל
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
        } else {
          setUserData(null); 
        }
        setLoading(false); 
      });
    } else {
      setLoading(false); 
      navigation.reset({
        index: 0, 
        routes: [{ name: 'Login' }] 
      });
    }
  }, [user, navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  let profileImage;
  if (userData?.profileImage === 'female') {
    profileImage = womanImage; 
  } else if (userData?.profileImage === 'male') {
    profileImage = manImage; 
  } else {
    profileImage = manImage; 
  }

  // הצגת המודאל
  const openProfileModal = () => {
    setIsModalVisible(true);
  };

  const closeProfileModal = () => {
    setIsModalVisible(false);
  };

  // פונקציה להתנתקות
const handleLogout = () => {
    auth.signOut().then(() => {
      // נווט למסך WelcomeScreen לאחר ההתנתקות
      navigation.reset({
        index: 0,  // מציין שהסטאק יאופס
        routes: [{ name: 'WelcomeScreen' }]  // ניווט למסך WelcomeScreen
      });
      closeProfileModal();
    }).catch((error) => {
      console.log("Error during logout: ", error);
    });
  };

  return (
    <View style={styles.container}>
      {/* חלק העליון עם רקע ותמונה */}
      <View style={styles.header}>
        <Image 
          source={require("../assets/images/raft.jpeg")} 
          style={styles.backgroundImage} 
        />
        <View style={styles.profileContainer}>
          <Image 
            source={profileImage} 
            style={styles.profileImage} 
          />
          <Text style={styles.welcomeText}>
            ברוך הבא, {userData ? `${userData.firstName} ${userData.lastName}` : 'אורח'}
          </Text>
          <Text style={styles.subText}>איך אפשר לעזור לך היום?</Text>
        </View>
      </View>

      {/* כפתור פרופיל */}
      <TouchableOpacity style={styles.profileButton} onPress={openProfileModal}>
        <Text style={styles.profileButtonText}>👤 פרופיל שלי</Text>
      </TouchableOpacity>

      {/* התפריט המרכזי */}
      <ScrollView contentContainerStyle={styles.menu}>
        <MenuItem icon="🗨️" title="שוחח עם AI" />
        <MenuItem icon="🧑‍⚕️" title="מצא מטפל" />
        <MenuItem icon="📚" title="זכויות ומידע" />
        <MenuItem icon="🚨" title="כפתור חירום" />
        <MenuItem 
          icon="🎭" 
          title="אירועים קרובים"
          onPress={() => {
            console.log('Navigating to NearbyEventsScreen');
            navigation.navigate('NearbyEventsScreen'); 
          }} // נווט למסך הקרוב
        />
        <MenuItem icon="📝" title="פוסטים אנונימיים" />
        <MenuItem 
    icon="📢" 
    title="משוב ודיווח"
    onPress={() => {
      console.log('Navigating to FeedbackScreen');
      navigation.navigate('FeedbackScreen'); // ניווט למסך משוב
    }}
  />
</ScrollView>

      {/* Modal של פרופיל */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeProfileModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>אפשרויות פרופיל</Text>
            <TouchableOpacity onPress={() => { /* עמוד שינוי פרטים אישיים */ }} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>שינוי פרטים אישיים</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { /* עמוד שינוי סיסמא */ }} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>שינוי סיסמא</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>התנתקות</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeProfileModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>❌ סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#007AFF',
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
  // Modal Styles
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
    backgroundColor: '#007AFF',
    paddingVertical: 12,  // גובה אחיד
    paddingHorizontal: 20, // רוחב אחיד
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',  // כפתור שנמצא על כל רוחב המודאל
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
    color: 'red',
  },
});


export default UserHomeScreen;