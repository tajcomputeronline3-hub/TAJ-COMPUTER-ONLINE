TAJ COMPUTER ONLINE - FULL WEBSITE (FRONTEND + BACKEND)

इस प्रोजेक्ट में:
- Home Dashboard: दुकान का नाम और कुल सेवाओं की संख्या
- Services: सेवाओं के नाम, दस्तावेज, लाभ और वैकल्पिक फोटो
- About: दुकान का पता, फोन, WhatsApp, Maps और फोटो सेक्शन
- Admin Panel: Login, सेवा जोड़ना, Edit करना, Delete करना
- Backend: Node.js + Express + SQLite database
- Admin password सुरक्षित hash के रूप में database में रखा जाता है।

चलाने के लिए:
1. कंप्यूटर पर Node.js LTS इंस्टॉल करें।
2. इस फोल्डर में terminal खोलें।
3. npm install चलाएँ।
4. .env.example की कॉपी बनाकर उसका नाम .env रखें।
5. .env में ADMIN_PASSWORD और SESSION_SECRET बदलें।
6. npm start चलाएँ।
7. ब्राउज़र में http://localhost:3000 खोलें।

डिफॉल्ट यूज़रनेम: admin
डिफॉल्ट पासवर्ड: ChangeThisPassword123!
पहली बार चलाने से पहले .env में अपना मजबूत पासवर्ड जरूर सेट करें।

महत्वपूर्ण:
यह पूरा source project है, अभी सार्वजनिक वेबसाइट लिंक नहीं है। इसे इंटरनेट पर सभी के लिए चलाने हेतु Node.js hosting/server पर deploy करना होगा। SQLite database और uploads folder की persistent storage hosting पर चालू रखें। केवल HTML फाइल भेजने से admin बदलाव सभी ग्राहकों तक sync नहीं होंगे।
दुकान की असली फोटो Admin के जरिए सेवाएँ जोड़ते समय service image के रूप में अपलोड की जा सकती है; About सेक्शन के placeholder फोटो बदलने के लिए public/index.html संपादित करें।
