import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FAQModal from "./FAQScreen"; // ודא שהנתיב נכון
import { getDatabase, ref, get } from "firebase/database"; // ייבוא Firebase

const RightsInfoScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [faqModalVisible, setFaqModalVisible] = useState(false); // הוספת משתנה לפתיחת המודאל
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // חדש - מצב שמראה אם מחפשים
  const [isScrolling, setIsScrolling] = useState(false);


  // שליפת הנתונים מה-Database
const fetchData = async () => {
  try {
    setLoading(true);
    const db = getDatabase();
    const rightsRef = ref(db, "rights");
    const articlesRef = ref(db, "articles");
    const centersRef = ref(db, "supportCenters");

    const [rightsSnap, articlesSnap, centersSnap] = await Promise.all([
      get(rightsRef),
      get(articlesRef),
      get(centersRef),
    ]);

    let rightsData = rightsSnap.exists() ? Object.values(rightsSnap.val()) : [];
    let articlesData = articlesSnap.exists() ? Object.values(articlesSnap.val()) : [];
    let centersData = [];

    if (centersSnap.exists()) {
      const centers = centersSnap.val();
      Object.keys(centers).forEach(region => {
        centersData = [...centersData, ...Object.values(centers[region])];
      });
    }

    return { rightsData, articlesData, centersData };
  } catch (error) {
    console.error("שגיאה בטעינת הנתונים:", error);
    return { rightsData: [], articlesData: [], centersData: [] };
  } finally {
    setLoading(false);
  }
};

// חיפוש מידע לפי שאילתה
const handleSearch = async (query) => {
  setSearchQuery(query);
  if (!query) {
    setSearchResults([]);
    return;
  }

  const { rightsData, articlesData, centersData } = await fetchData();

  const filteredRights = rightsData.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredArticles = articlesData.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCenters = centersData.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.address.toLowerCase().includes(query.toLowerCase())
  );

  setSearchResults([
    ...filteredRights.map((item) => ({ ...item, type: "right" })),
    ...filteredArticles.map((item) => ({ ...item, type: "article" })),
    ...filteredCenters.map((item) => ({ ...item, type: "center" })),
  ]);
};
const handleResultPress = (item) => {
  setIsScrolling(false); // המשתמש לחץ על תוצאה, אז איפוס הגלילה
  setSearchResults([]); // סגירת תיבת התוצאות
  setSearchQuery(""); // ניקוי שדה החיפוש

  if (item.type === "right") {
    navigation.navigate("RightsListScreen", { data: item });
  } else if (item.type === "article") {
    navigation.navigate("ExternalArticlesScreen", { data: item });
  } else if (item.type === "center") {
    navigation.navigate("SupportCentersScreen", { data: item });
  }
};

// **סגירת החיפוש אם המשתמש לא הקליד כלום וניסה לגלול**
const handleScroll = () => {
  setIsScrolling(true); // המשתמש התחיל לגלול
  setTimeout(() => {
    if (isScrolling && !searchQuery) { 
      setSearchResults([]); // מחיקת תוצאות
      Keyboard.dismiss(); // סגירת המקלדת
      setIsScrolling(false); // איפוס המצב
    }
  }, 500); // עיכוב קטן לבדיקה אם המשתמש הפסיק לגלול
};
const handleDismissKeyboard = () => {
  setSearchResults([]); // מחיקת התוצאות
  setSearchQuery(""); // ניקוי שדה החיפוש
  Keyboard.dismiss(); // סגירת המקלדת
};


  // פתיחת המודאל עם תוכן מותאם
  const openModal = (content) => {
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>

      {/* מודאל שמופיע כאשר לוחצים על אייקון */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalContent}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* אזור כחול עם כותרת ושדה חיפוש */}
      <View style={styles.header}>
        {/* חץ חזרה לדף הבית */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>מידע וזכויות</Text>
        <Text style={styles.subTitle}>באפליקציה זו תוכלו למצוא מידע חשוב על זכויותיכם, גישה לשירותים רלוונטיים, ומענה מהיר בנושאים שונים, הכל במקום אחד ובצורה נוחה.</Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={30} color="#007AFF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="חיפוש זכויות ומידע"
              placeholderTextColor="#007AFF"
              value={searchQuery}
              onChangeText={handleSearch}
              textAlign="right"
            />
          </View>
        </View>
      </View>

      {/* קו מפריד */}
      <View style={styles.separator} />  
    
      {searchQuery.length > 0 && searchResults.length > 0 ? (
  <ScrollView 
    style={styles.resultsContainer}
    onScrollBeginDrag={handleScroll} 
    keyboardShouldPersistTaps="handled"
  >
    {searchResults.map((item, index) => (
      <TouchableOpacity key={index} style={styles.resultItem}
        onPress={() => handleResultPress(item)}
      >
        <Ionicons 
          name={item.type === "right" ? "book-outline" : item.type === "article" ? "document-text-outline" : "location-outline"} 
          size={20} color="#007AFF" 
        />
        <Text style={styles.resultText}>{item.title || item.name}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
) : searchQuery.length > 0 ? (
  <Text style={styles.noText}>לא נמצאו תוצאות</Text>
) : null }

      {/* אייקונים בקוביות */}
      <ScrollView contentContainerStyle={styles.iconsContainer}>
        <View style={styles.row}>
        <TouchableOpacity
          style={styles.iconBox}
          onPress={() => navigation.navigate("RightsListScreen")}>
          <Ionicons name="book-outline" size={40} color="#005A8D" />
          <Text style={styles.iconText}>זכויות</Text>
        </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBox}
            onPress={() => navigation.navigate("ExternalArticlesScreen")}>
            <Ionicons name="document-text-outline" size={40} color="#005A8D" />
            <Text style={styles.iconText}>מאמרים חיצוניים</Text>
          </TouchableOpacity> 
        </View>
        
        
        <View style={styles.row}>
        <TouchableOpacity
            style={styles.iconBox}
            onPress={() => navigation.navigate("SupportCentersScreen")}>
            <Ionicons name="location-outline" size={40} color="#005A8D" />
            <Text style={styles.iconText}>מרכזי תמיכה</Text>
        </TouchableOpacity> 


          <TouchableOpacity style={styles.iconBox} onPress={() => setFaqModalVisible(true)}>
            <Ionicons name="help-circle-outline" size={40} color="#005A8D" />
            <Text style={styles.iconText}>שאלות נפוצות</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lastRow}>
          <TouchableOpacity style={[styles.iconBox, styles.lastIconBox]} onPress={() => openModal(
            <View>
              <Text style={styles.modalTitle}>צוות הפיתוח</Text>
              <View style={styles.developerContainer}>
                <Image source={require('../assets/images/avital.jpg')} style={styles.developerImage} />
                <Text style={styles.developerName}>אביטל צ'יקוטה</Text>
                <Text style={styles.developerText}>מפתחת full-stack שפיתחה מגוון פונקציונאליות באתר זה, בדגש על חוויית משתמש ונגישות.</Text>
              </View>
              <View style={styles.developerContainer}>
                <Image source={{ uri: Image.resolveAssetSource(require('../assets/images/eden.jpg')).uri }} style={styles.developerImage} />
                <Text style={styles.developerName}>עדן מימוני</Text>
                <Text style={styles.developerText}>מפתחת full-stack שהתמקדה בפיתוח צד שרת ואופטימיזציה של הביצועים באתר.</Text>
              </View>
            </View>
          )}>
            <Ionicons name="people-outline" size={40} color="#005A8D" />
            <Text style={styles.iconText}>צוות פיתוח</Text>
          </TouchableOpacity>
        </View>

        {/* מודאל לשאלות נפוצות */}
        <FAQModal visible={faqModalVisible} onClose={() => setFaqModalVisible(false)} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    padding: 0,
  },
  header: {
    backgroundColor: '#005A8D',
    paddingTop: 100,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginTop: 15,
    width: '100%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    textAlign: 'right',
  },

  resultsContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
    maxHeight: 200, // גובה מקסימלי כדי שהתוצאות לא ישתלטו על כל המסך
    
  },
  resultItem: {
    flexDirection: "row-reverse", // שימי כאן "row-reverse" כדי שהתוצאות יופיעו בצד ימין
    alignItems: "right",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  
  
  resultText: {
    fontSize: 15,
    marginLeft: 80,
    marginRight: 10,
    color: "#333",
  },
  
  iconsContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#007AFF',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  lastRow: {
    flexDirection: 'row',
    justifyContent: 'center', // ממורכז אם אין בן זוג בקוביות
    width: '90%',
    marginBottom: 20,
  },
  iconBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '47%',
  },
  iconText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#005A8D',
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  developerContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  developerImage: {
    width: 100, 
    height: 100, 
    borderRadius: 50, // הופך את התמונה לעגולה
    marginBottom: 10,
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  developerText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: "row",
    //justifyContent: "space-between",
    alignItems: "center",
    //flexDirection: "row-reverse", // הצגת השאלה מימין והחץ משמאל
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#005A8D",
    textAlign: "right", // טקסט השאלה יתחיל מימין
    flex: 1, // כדי שהחץ לא ידחוק את השאלה
  },
  
  answer: {
    fontSize: 14,
    color: "#333",
    marginTop: 10,
    lineHeight: 20,
  },
  noText: { textAlign: "center", marginTop: 20, color: "#555" },

});

export default RightsInfoScreen;
