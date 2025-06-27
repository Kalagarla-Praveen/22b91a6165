
# 🔗 URL Shortener App

A React-based web application to shorten long URLs with optional custom shortcodes and expiration times. It also provides a dashboard to view statistics like total clicks and active/expired links.

---

🚀 **Live Demo**:  
👉 [https://22b91a6165-4x5fy5fl5-praveens-projects-ec42932b.vercel.app/shortener](https://22b91a6165-4x5fy5fl5-praveens-projects-ec42932b.vercel.app/shortener)


## ✨ Features

- 🔗 Shorten any long URL
- ✏️ Create custom shortcodes (e.g., `/praveen`)
- ⏳ Set URL expiration in minutes (default: 30 mins)
- ➕ Add up to 5 URLs at once
- 📊 View total clicks, active/expired URLs, and statistics
- ✅ Clean and user-friendly UI

---

## 🚀 How to Run

1. Clone the project:

```bash
git clone https://github.com/Kalagarla-Praveen/22b91a6165.git
cd project
````

2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

4. Visit in browser:
   [http://localhost:3000](http://localhost:3000)

---

## 📸 Screenshots

### ✅ URL Shortener Page

![Shortener Page](./Screenshot%202025-06-27%20123437.png)

* Enter a long URL (e.g., `http://youtube.com`)
* (Optional) Add a custom shortcode like `praveen`
* (Optional) Set validity in minutes
* Click **Shorten URLs**
* You'll see a success message with a clickable short link and expiry time.

---

### 📊 Statistics Dashboard

![Statistics Page](./Screenshot%202025-06-27%20123513.png)

* View total URLs, total clicks, active and expired URLs
* See each URL's:

  * Short code
  * Original URL
  * Click count
  * Expiry time
  * Status (`Active` or `Expired`)

---

## 🧠 Technologies Used

* **Frontend**: React, Vite, TailwindCSS
* **Backend**: Node.js + Express (assumed)
* **Database**: MongoDB / SQLite (depending on setup)

---

## 📌 Example

**Input**:

* Long URL: `http://youtube.com`
* Custom Shortcode: `praveen`
* Validity: *empty (defaults to 30 mins)*

**Output**:

* Short URL: `http://localhost:3000/praveen`
* Expires: `6/27/2025, 1:04:22 PM`

---

## 📂 Folder Structure

```
project/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

---

## 🙌 Author

**Praveen Kalagarla**
GitHub: [@Kalagarla-Praveen](https://github.com/Kalagarla-Praveen)

