body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f5f7fa;
}

/* LOGIN */

.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 300px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.login-card input {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
}

.login-card button {
  width: 100%;
  padding: 12px;
  background: #3b5ed7;
  color: white;
  border: none;
  border-radius: 8px;
}

/* DASHBOARD */

.dashboard-layout {
  display: flex;
  height: 100vh;
}

/* SIDEBAR */

.sidebar {
  width: 220px;
  background: #1e293b;
  color: white;
  padding: 20px;
}

.sidebar h2 {
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 10px;
  cursor: pointer;
  border-radius: 6px;
}

.sidebar li:hover {
  background: rgba(255,255,255,0.1);
}

/* MAIN */

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* TOPBAR */

.topbar {
  background: white;
  padding: 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
}

/* CONTENT */

.content {
  padding: 20px;
}