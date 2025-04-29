import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebase';
import { fetchChatGPTKey } from '../../firebase'; 


const { width } = Dimensions.get('window');

const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [chatKey, setChatKey] = useState(null);



  useEffect(() => {
    
    const user = auth.currentUser;
    if (user) {
    //  כל המידע על המשתמש
    
    const loadKey = async () => {
      const key = await fetchChatGPTKey();
      console.log("✅ ChatGPT Key:", key);
      setChatKey(key);
    };

    loadKey();
    
  }

}, []);

  const toggleDrawer = () => {
    if (drawerOpen) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setDrawerOpen(false));
    } else {
      setDrawerOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderItem = (label, icon, screen, iconComponent = Ionicons) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(screen);
        toggleDrawer();
      }}
      style={styles.drawerRow}
    >
      {React.createElement(iconComponent, {
        name: icon,
        size: 20,
        color: '#333',
        style: styles.drawerIcon,
      })}
      <Text style={styles.drawerItem}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* כפתור ה-Hamburger Menu */}
      <TouchableOpacity
        style={[styles.menuButton, drawerOpen && styles.menuButtonOpen]}
        onPress={toggleDrawer}
      >
        <Ionicons name="menu" size={30} color={drawerOpen ? '#333' : '#005A8D'} />
      </TouchableOpacity>

      {/* שכבת רקע לסגירת התפריט בלחיצה חיצונית */}
      {drawerOpen && (
        <TouchableWithoutFeedback onPress={toggleDrawer}>
          <View style={styles.overlayBackground} />
        </TouchableWithoutFeedback>
      )}

      {/* תפריט צד */}
      <Animated.View style={[styles.drawer, { right: slideAnim }]}>
        <View style={styles.drawerHeader}>
          <Image
            source={
              userData?.profileImage === 'female'
                ? require('../assets/images/woman.png')
                : require('../assets/images/man.png')
            }
            style={styles.drawerAvatar}
          />
          <View style={styles.drawerUserInfo}>
            <Text style={styles.drawerUserName}>
              {userData ? `${userData.firstName} ${userData.lastName}` : 'משתמש'}
            </Text>
            <Text style={styles.drawerUserRole}>משתמש</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.drawerContent}>
          {renderItem('פרופיל', 'person-outline', 'ProfileScreen')}
          {renderItem('הנחיות למצב חירום', 'person-outline', 'ProfileScreen')}
          {renderItem('שוחח עם AI', 'chatbubbles-outline', 'Home')}
          {renderItem('פוסטים', 'notebook-outline', 'PostScreen', MaterialCommunityIcons)}
          {renderItem('מצא מטפל', 'user-md', 'Home', FontAwesome5)}
          {renderItem('זכויות ומידע', 'book-outline', 'RightsInfoScreen')}
          {renderItem('אירועים קרובים', 'calendar-outline', 'NearbyEventsScreen')}
          {renderItem('משוב ודיווח', 'megaphone-outline', 'Home')}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 40, // ממוקם מעל כל התוכן
    left: 10, // במיקום יותר בולט בצד שמאל
    zIndex: 5,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
  },
  menuButtonOpen: {
    backgroundColor: '#f0f0f0', // צבע בהיר יותר עבור כפתור פתוח
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // קצת יותר כהה
    zIndex: 2,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.65,
    backgroundColor: '#fff',
    zIndex: 3,
    elevation: 6,
    borderLeftWidth: 1,
    borderColor: '#eee',
    paddingTop: 70,
  },
  drawerHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  drawerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 12,
  },
  drawerUserInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  drawerUserRole: {
    fontSize: 12,
    color: '#888',
  },
  drawerContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  drawerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
  },
  drawerIcon: {
    marginLeft: 14,
  },
  drawerItem: {
    fontSize: 16,
    color: '#333',
  },
});

export default AppLayout;
