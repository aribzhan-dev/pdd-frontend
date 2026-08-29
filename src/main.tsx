import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "@/app/App";

import "@/styles/global.css";
import "@/components/dialog.css";
import "@/components/header.css";
import "@/features/auth/login.css";
import "@/features/catalog/catalog.css";
import "@/features/quiz/quiz.css";
import "@/features/quiz/result.css";
import "@/features/staff/staff.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
