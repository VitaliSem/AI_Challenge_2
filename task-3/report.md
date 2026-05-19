# Report: Tools and Techniques Used for Building an AI‑Driven Telegram Learning Bot

## Overview

This project focuses on building an automated Telegram bot for analyzing web pages, summarizing their content, and delivering structured learning materials and quizzes to users. The solution combines workflow automation, large language models (LLMs), and cloud-based data storage to create a flexible and cost-aware learning system.

---

## Workflow Automation with n8n

The backbone of the system is **n8n**, which was used to design and orchestrate the entire automation workflow. n8n allowed the integration of multiple services and tools into a single, maintainable pipeline, including:

- Telegram Bot API for user interaction
- AI agents for content analysis, summarization, and quiz generation
- Google Sheets for persistent storage of materials and quiz data

Using n8n made it possible to visually design the logic, split responsibilities across nodes, and reduce manual glue code.

---

## Telegram Bot Integration

Telegram was chosen as the primary user interface due to its simplicity and built-in features such as **Telegram Polls**, which are well suited for quizzes.

The bot supports:
- Receiving URLs from users
- Delivering summarized learning materials
- Sending quiz questions one by one as polls
- Providing explanations after each answer

---

## AI Agents and Prompt Engineering

Several AI agents were used throughout the workflow, each with a narrowly defined responsibility:

- Web page analysis and summarization  
- Learning material structuring  
- Quiz question generation  
- User answer validation and explanation  

### Prompt Design

Prompts were carefully crafted and iteratively improved to ensure:

- Deterministic, machine-readable outputs  
- Minimal hallucinations  
- Compatibility with n8n parsing logic  

**Copilot** and **Gemini** were both used to design and refine prompts. Copilot was particularly helpful for structuring prompts for production use, while Gemini assisted with workflow reasoning and iteration.

---

## AI Models and OpenRouter

The AI agents were powered via an **OpenRouter subscription**, enabling access to multiple models, including:

- DeepSeek  
- ChatGPT‑4o  
- Other OpenAI‑compatible models  

A major challenge was selecting models that:

- Correctly extract and structure data from URLs  
- Reliably generate quizzes and validate user answers  
- Remain cost‑effective for frequent usage  

Balancing accuracy and cost required experimentation and model switching depending on the task.

---

## Challenges with Memory and Context

One significant difficulty was managing **AI agent memory**. Some agents tended to retain context longer than desired and occasionally reused it incorrectly.

Attempts were made to mitigate this by:

- Using session-specific unique IDs  
- Isolating context per user and per interaction  

While this approach improved behavior, it is not yet perfect and remains an area for further optimization.

---

## Data Storage with Google Sheets

**Google Sheets** was used as a lightweight database to store:

- Learning materials (main tab)  
- Generated quiz questions (quiz tab)  
- Relationships between materials and quizzes  

This approach provided:

- Easy inspection and debugging  
- Simple read/write integration with n8n  
- Sufficient performance for a Telegram bot MVP  

---

## Conclusion

The solution demonstrates how no-code/low-code automation, combined with modern LLMs, can be used to build a functional and extensible learning platform inside Telegram.

Despite challenges related to model selection, cost optimization, and memory management, the system successfully delivers automated content analysis, structured learning materials, and interactive quizzes to users.

Future improvements may focus on:

- Better memory isolation  
- Adaptive model selection  
- More robust user progress tracking  
``