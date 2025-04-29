import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const faqData = [
  {
    question: "איך ניתן לקבל תמיכה רגשית באמצעות האפליקציה?",
    answer:
      "האפליקציה מספקת צ'אט מבוסס AI שיכול להעניק תמיכה רגשית מיידית. בנוסף, ניתן להתחבר לקהילה תומכת ולשתף חוויות באופן אנונימי.",
  },
  {
    question: "האם אני יכול למצוא קבוצות תמיכה באזור שלי?",
    answer:
      "כן, האפליקציה מציעה פונקציה מבוססת GPS שמציגה מפגשים ואירועים חברתיים הקרובים אליך.",
  },
  {
    question: "מהם הכלים הזמינים למצבי חירום?",
    answer:
      "האפליקציה כוללת כפתור חירום המאפשר ליצור קשר מיידי עם גורמי תמיכה מקצועיים במקרה הצורך.",
  },
  {
    question: "איך ניתן לדעת מהן הזכויות שלי?",
    answer:
      "באפליקציה ישנו מידע מקיף על זכויות נפגעי מלחמה ומתמודדים עם חרדה ודיכאון, כולל הפניות למרכזי סיוע מקצועיים.",
  },
  {
    question: "האם הפרטים האישיים שלי מוגנים?",
    answer:
      "כן, כל הנתונים שלך נשמרים באופן מאובטח, ושיתופי החוויות בקהילה נעשים בצורה אנונימית לחלוטין.",
  },
];

const FAQModal = ({ visible, onClose }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>שאלות נפוצות</Text>
          <ScrollView contentContainerStyle={styles.faqContainer}>
            {faqData.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleAnswer(index)}
                >
                  <Text style={styles.question}>{item.question}</Text>
                  <Ionicons
                    name={openIndex === index ? "chevron-up" : "chevron-down"}
                    size={22}
                    color="#005A8D"
                  />
                </TouchableOpacity>
                {openIndex === index && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answer}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#005A8D",
  },
  faqContainer: {
    width: "100%",
  },
  faqItem: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  questionContainer: {
    flexDirection: "row-reverse", // השאלה תהיה מימין, החץ משמאל
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#005A8D",
    textAlign: "right",
    flex: 1,
  },
  answerContainer: {
    backgroundColor: "#FFFF",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    marginHorizontal: 10,
  },
  answer: {
    fontSize: 16,
    color: "#005A8D",
    textAlign: "right",
    lineHeight: 25,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#005A8D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FAQModal;
