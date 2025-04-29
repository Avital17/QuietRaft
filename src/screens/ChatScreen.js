import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Animated, Dimensions,
  ScrollView, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, ref, push, set, onValue, remove } from 'firebase/database';
import { auth } from '../../firebase';
import { chatGPT_KEY } from '../../firebase';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const backgroundColors = [
  '#E3F2FD', // תכלת פסטלי
  '#E0FBE2', // ירקרק פסטלי
  '#FFF8E1', // שמנת
  '#FFF9C4', // צהוב פסטלי
  '#E1BEE7',  // סגול פסטלי
  '#F5F5F5'  // אפור פסטלי בהיר (חדש)
];

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#E3F2FD');
  const [chatsList, setChatsList] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);

  const db = getDatabase();
  const userId = auth.currentUser?.uid;
  const drawerAnim = useRef(new Animated.Value(-width)).current;
  const navigation = useNavigation();
  useEffect(() => {
    if (userId) {
      const userRef = ref(db, `users/${userId}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setUserData(data); // קודם כל נביא את המשתמש
      });
  
      loadBackgroundColor();
    }
  }, [userId]);

  useEffect(() => {
    if (userData && userId && messages.length === 0 && !currentChatId) {
      createNewChat();
    }
  }, [userData, userId, messages, currentChatId]);
  
  
  useEffect(() => {
    if (userData && userId && currentChatId) {
      const chatRef = ref(db, `users/${userId}/chats/${currentChatId}`);
      const unsubscribeMessages = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loaded = Object.values(data);
          setMessages(loaded);
        }
      });
  
      const chatsListRef = ref(db, `users/${userId}/chatsList`);
      const unsubscribeChatsList = onValue(chatsListRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setChatsList(Object.entries(data));
      });
  
      return () => {
        unsubscribeMessages();
        unsubscribeChatsList();
      };
    }
  }, [userData, userId, currentChatId]);
  
  

  const loadBackgroundColor = async () => {
    const color = await AsyncStorage.getItem('chatBackgroundColor');
    if (color) setBackgroundColor(color);
  };

  const saveBackgroundColor = async (color) => {
    await AsyncStorage.setItem('chatBackgroundColor', color);
    setBackgroundColor(color);
    toggleDrawer();
  };

  const toggleDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: isDrawerOpen ? -width : 0,
      duration: 300,
      useNativeDriver: false
    }).start(() => setIsDrawerOpen(!isDrawerOpen));
  };
  
  const createNewChat = async () => {
    const newChatRef = push(ref(db, `users/${userId}/chats`));
    const chatId = newChatRef.key;
    setCurrentChatId(chatId);
  
    const welcomeMessage = {
      text: getGreeting(userData ? userData.firstName : ''),
      sender: 'bot',
      timestamp: Date.now(),
    };
  
    await push(ref(db, `users/${userId}/chats/${chatId}`), welcomeMessage);
  
    // מוסיפים את הכותרת גם ברשימת השיחות
    await set(ref(db, `users/${userId}/chatsList/${chatId}`), summarizeTitle(welcomeMessage.text));
  };
  
  const summarizeTitle = (text) => {
    if (!text) return 'שיחה חדשה';
    const words = text.split(' ');
    return words.length > 5 ? words.slice(0, 5).join(' ') + '...' : text;
  };

  const getGreeting = (name) => {
    const hour = new Date().getHours();
    
    let greeting;
  
    if (hour >= 5 && hour < 12) {
      greeting = 'בוקר טוב';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'צהריים טובים';
    } else if (hour >= 18 && hour < 22) {
      greeting = 'ערב טוב';
    } else {
      greeting = 'לילה טוב';
    }
  
    return `${greeting} ${name ? name : ''}! מה שלומך היום?`;
  };
  

  const handleSend = async () => {
    if (!input.trim()) return;

    const chatRef = ref(db, `users/${userId}/chats/${currentChatId}`);
    const newMessage = { text: input, sender: 'user', timestamp: Date.now() };

    await push(chatRef, newMessage);

    const chatTitleRef = ref(db, `users/${userId}/chatsList/${currentChatId}`);
    set(chatTitleRef, summarizeTitle(input));

    setInput('');

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content:
            `
            אתה מטפל NLP ויועץ רגשי תומך. תפקידך הוא ללוות את המשתמש/ת בשיחה רגשית, קצרה, חמה ומכילה, ללא שיפוטיות ובשפה רגישה, נעימה ומבינה.

כל תגובה שלך חייבת לעמוד בכללים הבאים:
- תגיב **רק בעברית**.
- כל תשובה שלך תהיה **קצרה**: משפט אחד או שניים בלבד.
- תגיב באופן חם, אמפתי, תומך ומכיל.
- כל תגובה תכלול **שיקוף רגשי** עדין של מה שנאמר, ו**שאלה פתוחה** שמעודדת שיתוף נוסף.
- אין לחזור על משפטים שכבר נאמרו.
- אין להסביר, לנתח או לייעץ. אתה לא מטפל קליני. אתה מקשיב, שואל ומכיל בלבד.
- אם המשתמש/ת מזכיר/ה פעילות שמרגיעה אותו/ה (למשל ציור, ריצה, קניות, מוזיקה) — עודד בעדינות חזרה לפעילות, אך **אל תפתח שיחה על התחום עצמו**.

בעת פתיחת שיחה, שאל בעדינות:
- איך עבר עליך היום?
- מה תפס אותך במיוחד היום?
- היה משהו קטן ששימח אותך היום?

אם המשתמש/ת לא משתף/ת, אמור:
"לפעמים קשה לדעת מה מרגישים. אולי ננסה להבין יחד?"

---

**זיהוי מצוקה – חובה לזהות בכל שלב:**

בכל שלב, לפני כל תגובה שלך, אתה מחויב לסרוק את ההודעה האחרונה של המשתמש/ת ולבדוק אם היא כוללת אחת מהביטויים הבאים (גם אם ההקשר הכללי של השיחה רגוע):

- בעברית: "אני רוצה למות", "אין לי כוח", "אין טעם לחיים", "מוות", "התקף חרדה", "קשה לי לנשום", "אני רוצה להיעלם", "לא מצליח להתמודד"
- באנגלית: "I want to die", "I want to kill myself", "death", "I have no strength", "life has no meaning", "panic attack", "can't breathe", "I want to disappear", "I can't cope"

אם מופיע אחד מהם, **עצור את השיחה הרגילה מיד** וענה אך ורק כך (בעברית בלבד):

"נשמע שעובר/ת עליך רגע קשה מאוד. אני כאן איתך. אני ממליץ/ה להשתמש בכפתור החירום באפליקציה כדי לפנות למד״א או לאיש קשר קרוב."

יש לוודא שכפתור החירום מוצג באופן ברור באפליקציה.

---

**זיהוי שפה פוגענית – חובה לעצור:**

אם הודעת המשתמש כוללת ביטויים פוגעניים כמו:
- בעברית: "מטומטם", "סתום", "חלאה", "תמות", "זבל"
- באנגלית: "idiot", "go to hell", "trash", "shut up", "die"

עצור את השיחה מיד וענה רק כך:
"נראה שהשיחה הפכה לפחות נעימה. אני כאן כדי לעזור כשנוכל לדבר בצורה מכבדת."

---

**חשוב מאוד**:  
אל תתבסס על ההקשר הכללי של השיחה בלבד.  
בכל הודעה חדשה מהמשתמש, בצע סריקה מחודשת – גם אם הכל נראה רגוע.  
כל זיהוי של ביטוי מצוקה או פוגענות מחייב תגובה מיידית, ללא ניתוח נוסף.

---

המטרה שלך אינה לפתור, אלא **ללוות, להכיל, לשאול ולשקף** – כמו אדם מקשיב עם לב פתוח.

            `}
            ,
          { role: 'user', content: input }
        ]
      }, {
        headers: { 'Authorization': `Bearer ${chatGPT_KEY}`, 'Content-Type': 'application/json' }
      });

      const reply = response.data.choices[0].message.content;
      await push(chatRef, { text: reply, sender: 'bot', timestamp: Date.now() });
    } catch (error) {
      Alert.alert('שגיאה', 'הבקשה לשרת נכשלה.');
    }
  };

  const handleDeleteChat = async (chatId) => {
    await remove(ref(db, `users/${userId}/chats/${chatId}`));
    await remove(ref(db, `users/${userId}/chatsList/${chatId}`));
    setMenuVisible(null);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const handleFocusInput = () => {
    if (isDrawerOpen) {
      toggleDrawer();
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor }]} behavior="padding">

      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#005A8D" />
        </TouchableOpacity>

        <Text style={styles.headerText}>{userData ? `${userData.firstName} ${userData.lastName}` : 'אורח'}</Text>

        <TouchableOpacity onPress={toggleDrawer}>
          <Ionicons name="menu" size={35} color="#005A8D" />
        </TouchableOpacity>
      </View>

      {/* CHAT MESSAGES */}
      <FlatList
        data={messages.sort((a, b) => a.timestamp - b.timestamp)}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.chatContainer}
      />

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="הקלד הודעה..."
          value={input}
          onChangeText={setInput}
          onFocus={handleFocusInput} // ברגע שמתמקדים בטקסט - סגירת תפריט
        />
        <TouchableOpacity onPress={handleSend}>
          <Ionicons name="send" size={26} color="#005A8D" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
      </View>

      {/* DRAWER */}
      <Animated.View style={[styles.drawer, { right: drawerAnim }]}>
        <ScrollView contentContainerStyle={{ padding: 20}}>
          
          <Text style={styles.drawerTitle}>בחר רקע:</Text>
          <View style={styles.colorOptionsRow}>
            {backgroundColors.map((color) => (
              <TouchableOpacity key={color} onPress={() => saveBackgroundColor(color)}>
                <View style={[styles.colorCircle, { backgroundColor: color }]} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.drawerTitle}>שיחות קודמות:</Text>
          {chatsList.map(([chatId, title]) => (
            <View key={chatId} style={styles.chatItemWrapper}>
              <TouchableOpacity onPress={() => { setCurrentChatId(chatId); toggleDrawer(); }}>
                <Text style={styles.chatItem}>{title}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuVisible(chatId)}>
                <Ionicons name="ellipsis-vertical" size={20} color="black" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* DELETE MENU */}
      {menuVisible && (
        <Modal transparent animationType="fade" visible={!!menuVisible}>
          <TouchableOpacity style={styles.modalBackground} onPress={() => setMenuVisible(null)}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={() => handleDeleteChat(menuVisible)}>
                <Text style={{ color: 'black', fontSize: 16 }}>מחק את היסטוריית השיחה</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatContainer: { padding: 15, paddingBottom: 80 },
  headerWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 45, paddingBottom: 10, backgroundColor: 'white', elevation: 3 },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#005A8D' },
  inputContainer: { flexDirection: 'row-reverse', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ccc', padding: 20, backgroundColor: 'white', paddingBottom: 25, },
  input: { flex:1, height: 40, borderRadius: 20, backgroundColor: '#eee', paddingHorizontal:15, marginLeft: 10, textAlign: 'right'
  },
  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 15, marginVertical: 5 },
  userBubble: { backgroundColor: '#B3E5FC', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#ECEFF1', alignSelf: 'flex-start' },
  messageText: { fontSize: 16, color: '#333' },
  drawer: { position: 'absolute', top: 75, bottom: 0, width: width * 0.7, backgroundColor: '#fff', elevation: 8, zIndex: 100 },
  drawerTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, textAlign: 'right' },
  chatItemWrapper: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  chatItem: { fontSize: 16, textAlign: 'right' },
  colorOptionsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', marginVertical: 10 },
  colorCircle: { width: 30, height: 30, borderRadius: 15, margin: 5, borderWidth: 1, borderColor: '#ccc' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 250, backgroundColor: 'white', padding: 15, borderRadius: 8, alignItems: 'center' },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#005A8D',
    marginVertical: 20,
  },
  
});

export default ChatScreen;
