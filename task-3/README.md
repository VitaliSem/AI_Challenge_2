# 🤖 AI Learning Telegram Bot

This Telegram bot helps you analyze web pages, generate learning summaries, and test your knowledge with quizzes.

## 🚀 Getting Started

1. Open the bot in Telegram  
2. Send the command:
```
/start
```
This initializes the conversation and shows available actions.

## 📚 How to Use

### 🔹 Learn from Web Content

Send a learning request with a link:
```
/learn <URL>
```

Example:
```
/learn https://example.com/article
```

What happens:
- The bot analyzes the web page
- Extracts key information
- Generates a structured, easy-to-read learning summary

---

### 🔹 Start a Quiz

Send:
```
/quiz
```

What happens:
- The bot shows the last 5 saved learning materials
- You choose which material you want to practice
- The bot prepares the quiz

---

## 🧠 Quiz Flow

- If quiz questions already exist, they are reused instantly  
- If not, the bot generates new questions (this may take some time)  
- Questions are sent one by one as Telegram Polls  

### ✅ Answering Questions

- Select one of the provided options  
- The bot will:
  - Check your answer  
  - Tell you if it is correct or not  
  - Provide a short explanation  

---

## ⚠️ Unknown Input

If you send an unsupported message, the bot will suggest available commands like:
- `/learn`
- `/quiz`

---

## 🗂 Features

- 🌐 Web page analysis  
- 📖 Structured summaries  
- 📝 Automatic quiz generation  
- 📊 Interactive polls  
- 💡 Answer explanations  

---

## ⏳ Notes

- Quiz generation may take some time on first use  
- Existing quizzes are reused for faster experience  

---

## 💡 Tips

- Provide high-quality learning materials for better results  
- Repeat quizzes to reinforce your knowledge  

---

Enjoy learning! 🚀
